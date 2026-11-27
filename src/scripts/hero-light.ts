import { reducedMotion } from './media';

const vertexSource = `
  attribute vec2 point;
  varying mediump vec2 uv;

  void main() {
    gl_Position = vec4(point, 0.0, 1.0);
    uv = point * vec2(0.5, -0.5) + 0.5;
  }
`;

const fragmentSource = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  varying mediump vec2 uv;
  uniform vec2 size;
  uniform vec4 rightArc;
  uniform vec4 leftArc;
  uniform vec2 pointer;
  uniform vec3 paper;
  uniform float time;

  float reflectedLight(vec2 point, vec4 arc, float side) {
    vec2 ray = (point - arc.xy - pointer * vec2(18.0, 12.0)) / arc.zw;
    float phase = time * 1.48 + side * 0.82;
    float angle = atan(ray.y, ray.x);
    float swell = 0.070 * sin(3.2 * angle - phase)
                + 0.026 * sin(6.0 * angle + phase * 0.66)
                + 0.022 * sin(phase * 0.88);
    float edge = length(ray) - 1.0 - swell;

    float crest = side * (0.93 + 0.51 * sin(phase * 0.69) + pointer.x * 0.17);
    float distanceToCrest = (angle - crest) * 3.4;
    float glint = exp(-distanceToCrest * distanceToCrest);
    float rim = exp(-abs(edge) * 112.0) * (0.38 + 0.46 * glint);
    float halo = exp(-edge * edge * 420.0) * (0.10 + 0.23 * glint);
    float wash = smoothstep(-0.26, -0.04, edge) * (1.0 - smoothstep(-0.03, 0.025, edge));
    float taper = smoothstep(0.10, 0.55, ray.y * side);
    float arcFade = smoothstep(-0.53, 0.57, ray.x + ray.y * side * 0.13);
    float spread = side > 0.0 ? 0.25 : 0.09;
    return (rim + halo + wash * spread) * taper * arcFade;
  }

  void main() {
    vec2 point = uv * size;
    float opacity = clamp(
      reflectedLight(point, rightArc, 1.0) + reflectedLight(point, leftArc, -1.0),
      0.0, 0.98
    );
    gl_FragColor = vec4(paper * opacity, opacity);
  }
`;

function createProgram(gl: WebGLRenderingContext) {
  const program = gl.createProgram();
  if (!program) return;

  for (const [kind, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(kind);
    if (!shader) {
      gl.deleteProgram(program);
      return;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }

  gl.linkProgram(program);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
}

function createRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    stencil: false,
  });
  if (!gl) return;

  const program = createProgram(gl);
  const vertices = gl.createBuffer();
  if (!program || !vertices) return;

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const point = gl.getAttribLocation(program, 'point');
  gl.enableVertexAttribArray(point);
  gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);

  const size = gl.getUniformLocation(program, 'size');
  const rightArc = gl.getUniformLocation(program, 'rightArc');
  const leftArc = gl.getUniformLocation(program, 'leftArc');
  const pointer = gl.getUniformLocation(program, 'pointer');
  const paper = gl.getUniformLocation(program, 'paper');
  const time = gl.getUniformLocation(program, 'time');

  return {
    resize(waves: HTMLElement, width: number, height: number) {
      // Read the same ellipses used by the static CSS fallback.
      const right = getComputedStyle(waves, '::before');
      const left = getComputedStyle(waves, '::after');
      const rightRadiusX = parseFloat(right.width) / 2;
      const rightRadiusY = parseFloat(right.height) / 2;
      const leftRadiusX = parseFloat(left.width) / 2;
      const leftRadiusY = parseFloat(left.height) / 2;
      const tint = parseInt(right.getPropertyValue('--color-paper').trim().slice(1), 16);
      const ratio = Math.min(devicePixelRatio, 1.25);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, width, height);
      gl.uniform4f(rightArc, width - parseFloat(right.right) - rightRadiusX,
        parseFloat(right.top) + rightRadiusY, rightRadiusX, rightRadiusY);
      gl.uniform4f(leftArc, parseFloat(left.left) + leftRadiusX,
        parseFloat(left.top) + leftRadiusY, leftRadiusX, leftRadiusY);
      gl.uniform3f(paper, ((tint >> 16) & 255) / 255, ((tint >> 8) & 255) / 255, (tint & 255) / 255);
    },
    draw(seconds: number, x: number, y: number) {
      gl.uniform1f(time, seconds);
      gl.uniform2f(pointer, x, y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
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
  const staticLight = () => reducedMotion.matches || forcedColors.matches;
  const paused = () => playback?.hasAttribute('data-playback-paused');

  const draw = () => {
    if (!renderer) return;
    if (resized) {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      renderer.resize(waves, width, height);
      resized = false;
    }
    renderer.draw(time, x, y);
    if (!waves.hasAttribute('data-wave-rendered')) waves.setAttribute('data-wave-rendered', '');
  };

  const animate = (now: number) => {
    frame = requestAnimationFrame(animate);
    if (now - lastDraw < 1000 / 36) return;
    const step = Math.min((now - lastDraw) / 1000, 0.065);
    lastDraw = now;
    time += step;
    x += (targetX - x) * step * 4;
    y += (targetY - y) * step * 4;
    draw();
  };

  const sync = () => {
    if (staticLight()) waves.removeAttribute('data-wave-rendered');
    if (staticLight() || !visible || document.hidden || paused()) {
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
    if (!frame || event.pointerType === 'touch') return;
    const { left, top, width, height } = canvas.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, (event.clientX - left) / width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - top) / height * 2 - 1));
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
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
