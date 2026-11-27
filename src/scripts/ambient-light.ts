import { ambientFragment, ambientVertex } from './ambient-shader';
import { createLightProgram, setLightColor } from './light-gl';
import { reducedMotion } from './media';

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function createRenderer(stage: HTMLCanvasElement) {
  const gl = stage.getContext('webgl', {
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    stencil: false,
  });
  if (!gl) return;

  const program = createLightProgram(gl, ambientVertex, ambientFragment);
  const triangle = gl.createBuffer();
  if (!program || !triangle) return;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, triangle);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    pixels: gl.getUniformLocation(program, 'pixels'),
    seconds: gl.getUniformLocation(program, 'seconds'),
    scroll: gl.getUniformLocation(program, 'scroll'),
    profile: gl.getUniformLocation(program, 'profile'),
    tone: gl.getUniformLocation(program, 'tone'),
    bubbles: gl.getUniformLocation(program, 'bubbles'),
  };
  const palette = getComputedStyle(document.documentElement);
  for (const name of ['paper', 'sand', 'oak', 'forest', 'action']) setLightColor(gl, program, name, palette);

  return {
    begin(diameter: number, seconds: number) {
      const ratio = Math.min(devicePixelRatio, 1.25, 720 / diameter);
      const size = Math.max(1, Math.round(diameter * ratio));
      if (stage.width !== size) stage.width = size;
      if (stage.height !== size) stage.height = size;
      gl.uniform1f(uniforms.seconds, seconds);
      return ratio;
    },
    draw(surface: Surface, size: number, scroll: number) {
      const pixels = Math.min(stage.width, Math.max(1, size));
      const { canvas, output } = surface;
      if (canvas.width !== pixels) canvas.width = pixels;
      if (canvas.height !== pixels) canvas.height = pixels;

      gl.viewport(0, stage.height - pixels, pixels, pixels);
      gl.uniform1f(uniforms.pixels, pixels);
      gl.uniform1f(uniforms.scroll, scroll);
      gl.uniform2f(uniforms.profile, surface.profile, surface.mirror);
      gl.uniform1f(uniforms.tone, surface.tone);
      gl.uniform1f(uniforms.bubbles, surface.bubbles);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // Composite into the section's own stacking context without another WebGL context.
      output.globalCompositeOperation = 'copy';
      output.drawImage(stage, 0, 0, pixels, pixels, 0, 0, pixels, pixels);
    },
    dispose() {
      gl.deleteBuffer(triangle);
      gl.deleteProgram(program);
    },
  };
}

interface Surface {
  element: HTMLElement;
  lens: HTMLElement;
  story: boolean;
  canvas: HTMLCanvasElement;
  output: CanvasRenderingContext2D;
  profile: number;
  mirror: number;
  tone: number;
  bubbles: number;
}

export function setupAmbientLight() {
  const active = new Set<Surface>();
  const surfaces = new Map<HTMLElement, Surface>();
  for (const element of document.querySelectorAll<HTMLElement>('[data-ambient-light]')) {
    const lens = element.querySelector<HTMLElement>('[data-light-lens]');
    const canvas = element.querySelector('canvas');
    const output = canvas?.getContext('2d');
    if (!lens || !canvas || !output) continue;

    surfaces.set(lens, {
      element, lens, canvas, output,
      story: Boolean(element.closest('[data-story]')),
      profile: Number(element.dataset.ambientLight),
      mirror: element.dataset.lightSide === 'start' ? -1 : 1,
      tone: element.dataset.lightTone === 'forest' ? 1 : 0,
      bubbles: Number(element.hasAttribute('data-light-bubbles')),
    });
  }
  if (!surfaces.size) return () => {};

  const stage = document.createElement('canvas');
  const forcedColors = matchMedia('(forced-colors: active)');
  const story = document.querySelector('[data-story]');
  const reel = story?.querySelector('[data-story-reel]');
  const listeners = new AbortController();
  const { signal } = listeners;
  let renderer: ReturnType<typeof createRenderer>;
  let failed = false;
  let frame = 0;
  let lastDraw = 0;
  let seconds = 0;
  const headerOffset = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  let stickyTop = headerOffset();

  const staticLight = () => reducedMotion.matches || forcedColors.matches;
  const run = (now: number) => {
    frame = requestAnimationFrame(run);
    if (now - lastDraw < 1000 / 30 - 1 || !renderer) return;
    seconds += Math.min((now - lastDraw) / 1000, 0.065);
    lastDraw = now;
    const viewportHeight = window.innerHeight;
    const tiles = [...active].map((surface) => ({ surface, rect: surface.lens.getBoundingClientRect() }));
    const diameter = Math.max(1, ...tiles.map(({ rect }) => rect.width));
    const ratio = renderer.begin(diameter, seconds);
    const storyVisible = tiles.some(({ surface }) => surface.story);
    const pinned = storyVisible && story?.hasAttribute('data-story-cinema') ? reel?.getBoundingClientRect() : undefined;
    for (const { surface, rect } of tiles) {
      if (rect.width < 1 || rect.height < 1) continue;
      let passage = 0;
      if (surface.story) {
        passage = pinned
          ? clamp((stickyTop - pinned.top) / Math.max(1, pinned.height - viewportHeight + stickyTop))
          : clamp((viewportHeight - rect.top) / (viewportHeight + rect.height));
      }
      renderer.draw(surface, Math.round(rect.width * ratio), passage);
      if (!surface.element.hasAttribute('data-light-live')) surface.element.setAttribute('data-light-live', '');
    }
  };

  const sync = () => {
    const fixed = staticLight();
    const running = !fixed && !document.hidden;
    for (const surface of surfaces.values()) {
      surface.element.toggleAttribute('data-light-visible', running && active.has(surface));
      if (fixed || failed) surface.element.removeAttribute('data-light-live');
    }
    if (!running || failed || !active.size) {
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    if (frame) return;
    renderer ??= createRenderer(stage);
    if (!renderer) {
      failed = true;
      return;
    }
    lastDraw = performance.now();
    frame = requestAnimationFrame(run);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const surface = surfaces.get(target as HTMLElement);
      if (!surface) continue;
      if (isIntersecting) {
        active.add(surface);
      } else {
        active.delete(surface);
        surface.element.removeAttribute('data-light-live');
        surface.canvas.width = surface.canvas.height = 1;
      }
    }
    sync();
  }, { rootMargin: '60px 0px' });
  for (const lens of surfaces.keys()) observer.observe(lens);

  stage.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    renderer = undefined;
    failed = true;
    sync();
  }, { signal });
  stage.addEventListener('webglcontextrestored', () => {
    failed = false;
    sync();
  }, { signal });
  reducedMotion.addEventListener('change', sync, { signal });
  forcedColors.addEventListener('change', sync, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  window.addEventListener('resize', () => { stickyTop = headerOffset(); }, { signal });

  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    listeners.abort();
    renderer?.dispose();
    for (const surface of surfaces.values()) {
      surface.element.removeAttribute('data-light-visible');
      surface.element.removeAttribute('data-light-live');
      surface.canvas.width = surface.canvas.height = 1;
    }
  };
}
