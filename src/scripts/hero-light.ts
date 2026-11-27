import { reducedMotion } from './media';
import { createLightProgram, setLightColor } from './light-gl';
import { lightRimFragment } from './light-rim';

const vertexSource = `
  attribute vec2 rim;
  uniform vec2 size;
  uniform vec4 lens;
  uniform vec2 pointer;
  uniform float time;
  uniform float mirror;
  uniform float leftOffset;
  varying mediump vec3 light;

  void main() {
    float t = rim.x;
    vec2 localPointer = vec2(mix(pointer.x, -pointer.x, mirror), pointer.y);
    float sweep = t * 4.3 - time * 0.94 + localPointer.x * 0.36 - mirror * 1.0;
    float glint = smoothstep(-0.28, 0.94, cos(sweep));
    float flex = sin(t * 2.35 - time * 0.76);
    float fade = smoothstep(0.0, 0.18, t) * (1.0 - smoothstep(0.67, 1.0, t));

    float angle = mix(0.38, 1.48, t);
    vec2 direction = vec2(cos(angle), sin(angle));
    vec2 normal = normalize(direction / lens.zw);
    float curvature = flex * 4.5 * fade;
    float span = 35.0 * (1.0 + 0.10 * glint);
    float pointerLift = dot(normal, localPointer) * 3.0 * fade;
    vec2 point = lens.xy + direction * lens.zw + normal * (rim.y * span + curvature + pointerLift);
    point.x = mix(point.x, size.x - point.x, mirror);
    point.y += leftOffset * mirror;
    gl_Position = vec4(point / size * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
    light = vec3(rim.y, (0.65 + 0.29 * glint) * fade * mix(1.0, 0.64, mirror), glint);
  }
`;

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    stencil: false,
  });
  if (!gl) return;

  const program = createLightProgram(gl, vertexSource, lightRimFragment);
  const vertices = gl.createBuffer();
  if (!program || !vertices) return;

  const segments = 56;
  const vertexCount = (segments + 1) * 2;
  const rims = new Float32Array(vertexCount * 2);
  for (let index = 0; index <= segments; index++) {
    const parameter = index / segments;
    rims.set([parameter, -1, parameter, 1], index * 4);
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, rims, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'rim');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const size = gl.getUniformLocation(program, 'size');
  const lens = gl.getUniformLocation(program, 'lens');
  const pointer = gl.getUniformLocation(program, 'pointer');
  const time = gl.getUniformLocation(program, 'time');
  const mirror = gl.getUniformLocation(program, 'mirror');
  const leftOffset = gl.getUniformLocation(program, 'leftOffset');
  const palette = getComputedStyle(canvas);
  setLightColor(gl, program, 'paper', palette);
  setLightColor(gl, program, 'oak', palette);
  gl.uniform1f(gl.getUniformLocation(program, 'softness'), 0.72);

  return {
    resize(waves: HTMLElement, width: number, height: number) {
      const ratio = Math.min(devicePixelRatio, 1.15, 1600 / width);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, width, height);

      // Anchor the live bevel to the fallback ellipse.
      const edge = getComputedStyle(waves, '::before');
      const radiusX = parseFloat(edge.width) / 2;
      const radiusY = parseFloat(edge.height) / 2;
      const top = parseFloat(edge.top);
      const reflectedTop = parseFloat(getComputedStyle(waves, '::after').top);
      gl.uniform4f(lens, width - parseFloat(edge.right) - radiusX, top + radiusY, radiusX, radiusY);
      gl.uniform1f(leftOffset, reflectedTop - top);
    },
    draw(seconds: number, x: number, y: number) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(time, seconds);
      gl.uniform2f(pointer, x, y);
      gl.uniform1f(mirror, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
      gl.uniform1f(mirror, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);
    },
  };
}

export function setupHeroLight(canvas: HTMLCanvasElement, waves: HTMLElement, hero: HTMLElement) {
  const playback = hero.querySelector('[data-gallery-playback]');
  const forcedColors = matchMedia('(forced-colors: active)');
  let renderer: ReturnType<typeof createRenderer>;
  let visible = false;
  let resized = true;
  let frame = 0;
  let lastDraw = 0;
  let time = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let bounds: { left: number; top: number; width: number; height: number } | undefined;
  let pendingPointer: PointerEvent | undefined;
  const staticLight = () => reducedMotion.matches || forcedColors.matches;
  const paused = () => playback?.hasAttribute('data-playback-paused');

  const draw = () => {
    if (!renderer) return;
    if (resized) {
      const { left, top, width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      bounds = { left: left + window.scrollX, top: top + window.scrollY, width, height };
      renderer.resize(waves, width, height);
      resized = false;
    }
    renderer.draw(time, x, y);
    if (!waves.hasAttribute('data-wave-rendered')) waves.setAttribute('data-wave-rendered', '');
  };

  const animate = (now: number) => {
    frame = requestAnimationFrame(animate);
    if (now - lastDraw < 1000 / 60 - 1) return;
    const step = Math.min((now - lastDraw) / 1000, 0.065);
    lastDraw = now;
    time += step;
    if (pendingPointer && bounds) {
      const { left, top, width, height } = bounds;
      targetX = Math.max(-1, Math.min(1, (pendingPointer.pageX - left) / width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (pendingPointer.pageY - top) / height * 2 - 1));
      pendingPointer = undefined;
    }
    x += (targetX - x) * step * 2.5;
    y += (targetY - y) * step * 2.5;
    draw();
  };

  const sync = () => {
    const fixed = staticLight();
    const idle = fixed || !visible || document.hidden || Boolean(paused());
    waves.toggleAttribute('data-wave-idle', idle);
    if (fixed) waves.removeAttribute('data-wave-rendered');
    if (idle) {
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    if (waves.hasAttribute('data-wave-fallback') || frame) return;
    renderer ??= createRenderer(canvas);
    if (!renderer) {
      waves.setAttribute('data-wave-fallback', '');
      return;
    }
    draw();
    lastDraw = performance.now();
    frame = requestAnimationFrame(animate);
  };

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    renderer = undefined;
    resized = true;
    waves.removeAttribute('data-wave-rendered');
    waves.setAttribute('data-wave-fallback', '');
  });
  canvas.addEventListener('webglcontextrestored', () => {
    waves.removeAttribute('data-wave-fallback');
    sync();
  });
  hero.addEventListener('pointermove', (event) => {
    if (frame && event.pointerType !== 'touch') pendingPointer = event;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    pendingPointer = undefined;
    targetX = 0;
    targetY = 0;
  });
  if (playback) {
    new MutationObserver(sync).observe(playback, { attributeFilter: ['data-playback-paused'] });
  }
  new ResizeObserver(() => {
    resized = true;
    if (visible && paused() && !staticLight()) draw();
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);
  reducedMotion.addEventListener('change', sync);
  forcedColors.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
}
