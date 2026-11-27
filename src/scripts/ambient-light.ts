import { ambientProfiles, ambientVertex, type AmbientProfile } from './ambient-shader';
import { createLightProgram, setLightColor } from './light-gl';
import { lightRimFragment } from './light-rim';
import { reducedMotion } from './media';

interface Surface {
  element: HTMLElement;
  area: HTMLElement;
  profile: AmbientProfile;
  mirror: number;
  strength: number;
  seed: number;
  width: number;
  height: number;
}

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    stencil: false,
  });
  if (!gl) return;

  const program = createLightProgram(gl, ambientVertex, lightRimFragment);
  const buffer = gl.createBuffer();
  if (!program || !buffer) return;

  // Rasterize only the bevel strips, leaving the rest of each canvas transparent.
  const segments = 48;
  const count = (segments + 1) * 2;
  const points = new Float32Array(count * 2);
  for (let index = 0; index <= segments; index++) {
    const t = index / segments;
    points.set([t, -1, t, 1], index * 4);
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  const rim = gl.getAttribLocation(program, 'rim');
  gl.enableVertexAttribArray(rim);
  gl.vertexAttribPointer(rim, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const ellipse = gl.getUniformLocation(program, 'ellipse');
  const sweep = gl.getUniformLocation(program, 'sweep');
  const motion = gl.getUniformLocation(program, 'motion');
  const material = gl.getUniformLocation(program, 'material');
  const palette = getComputedStyle(document.documentElement);
  setLightColor(gl, program, 'paper', palette);
  setLightColor(gl, program, 'oak', palette);

  return {
    resize(width: number, height: number) {
      const scale = Math.min(devicePixelRatio, 1, 620 / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    draw(surface: Surface, seconds: number, scroll: number) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(material, surface.mirror, surface.strength);
      ambientProfiles[surface.profile].forEach((arc, index) => {
        gl.uniform4f(ellipse, ...arc.center, ...arc.radius);
        gl.uniform4f(sweep, ...arc.angles, arc.width, arc.strength);
        gl.uniform3f(motion, seconds, surface.seed + index * 0.82, scroll);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, count);
      });
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

interface Slot {
  canvas: HTMLCanvasElement;
  renderer: ReturnType<typeof createRenderer>;
  surface?: Surface;
  width: number;
  height: number;
}

const poolSize = 3;

export function setupAmbientLight() {
  const surfaces = new Map<HTMLElement, Surface>();
  for (const element of document.querySelectorAll<HTMLElement>('[data-ambient-light]')) {
    const area = element.querySelector<HTMLElement>('[data-light-area]');
    const profile = element.dataset.ambientLight as AmbientProfile;
    if (!area || !Object.hasOwn(ambientProfiles, profile)) continue;
    surfaces.set(area, {
      area, element, profile,
      mirror: Number(element.dataset.lightSide === 'end'),
      strength: element.dataset.lightTone === 'forest' ? 0.34 : 0.78,
      seed: surfaces.size * 0.93,
      width: 0,
      height: 0,
    });
  }
  if (!surfaces.size) return () => {};

  const visible = new Map<Surface, number>();
  const slots: Slot[] = [];
  const forcedColors = matchMedia('(forced-colors: active)');
  const events = new AbortController();
  const { signal } = events;
  let unavailable = false;
  let frame = 0;
  let lastDraw = 0;
  let seconds = 0;
  let scroll = window.scrollY;

  function release(slot: Slot) {
    slot.surface?.element.removeAttribute('data-light-live');
    slot.surface = undefined;
    slot.canvas.remove();
    slot.canvas.width = slot.canvas.height = 1;
    slot.width = slot.height = 0;
  }

  function makeSlot() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const renderer = createRenderer(canvas);
    if (!renderer) {
      unavailable = true;
      return;
    }
    const slot: Slot = { canvas, renderer, width: 0, height: 0 };
    slots.push(slot);
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      slot.renderer = undefined;
      release(slot);
      sync();
    }, { signal });
    canvas.addEventListener('webglcontextrestored', () => {
      slot.renderer = createRenderer(canvas);
      sync();
    }, { signal });
    return slot;
  }

  function draw(now: number) {
    frame = requestAnimationFrame(draw);
    if (now - lastDraw < 1000 / 30 - 1) return;
    seconds += Math.min((now - lastDraw) / 1000, 0.075);
    lastDraw = now;
    const travel = scroll * 0.0022 % (Math.PI * 2);
    for (const slot of slots) {
      const { surface, renderer } = slot;
      if (!surface || !renderer || !surface.width || !surface.height) continue;
      if (slot.width !== surface.width || slot.height !== surface.height) {
        renderer.resize(surface.width, surface.height);
        slot.width = surface.width;
        slot.height = surface.height;
      }
      renderer.draw(surface, seconds, travel);
      if (!surface.element.hasAttribute('data-light-live')) surface.element.setAttribute('data-light-live', '');
    }
  }

  function sync() {
    const fixed = reducedMotion.matches || forcedColors.matches;
    const running = !fixed && !document.hidden;
    for (const surface of surfaces.values()) {
      surface.element.toggleAttribute('data-light-visible', running && visible.has(surface));
    }
    if (fixed) for (const slot of slots) if (slot.surface) release(slot);
    if (running) {
      const wanted = [...visible].sort((a, b) => b[1] - a[1]).slice(0, poolSize).map(([surface]) => surface);
      for (const slot of slots) if (slot.surface && !wanted.includes(slot.surface)) release(slot);
      for (const surface of wanted) {
        if (slots.some((slot) => slot.surface === surface)) continue;
        const slot = slots.find((slot) => slot.renderer && !slot.surface)
          ?? (!unavailable && slots.length < poolSize ? makeSlot() : undefined);
        if (!slot) break;
        slot.surface = surface;
        surface.area.append(slot.canvas);
      }
    }
    if (!running || !slots.some((slot) => slot.surface)) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (!frame) {
      lastDraw = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }

  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, intersectionRatio, target } of entries) {
      const surface = surfaces.get(target as HTMLElement);
      if (!surface) continue;
      if (isIntersecting) visible.set(surface, intersectionRatio);
      else visible.delete(surface);
    }
    sync();
  }, { rootMargin: '28px 0px', threshold: [0, 0.22, 0.52] });
  const resize = new ResizeObserver((entries) => {
    for (const { target, contentRect } of entries) {
      const surface = surfaces.get(target as HTMLElement);
      if (!surface) continue;
      surface.width = contentRect.width;
      surface.height = contentRect.height;
    }
  });
  for (const area of surfaces.keys()) {
    observer.observe(area);
    resize.observe(area);
  }

  reducedMotion.addEventListener('change', sync, { signal });
  forcedColors.addEventListener('change', sync, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  window.addEventListener('scroll', () => { scroll = window.scrollY; }, { passive: true, signal });

  return () => {
    observer.disconnect();
    resize.disconnect();
    events.abort();
    cancelAnimationFrame(frame);
    for (const slot of slots) {
      slot.renderer?.dispose();
      release(slot);
    }
    for (const surface of surfaces.values()) surface.element.removeAttribute('data-light-visible');
  };
}
