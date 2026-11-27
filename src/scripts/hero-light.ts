import { reducedMotion } from './media';
import { createLightProgram, setLightColor } from './light-gl';

const vertexSource = `
  attribute vec3 rim;
  uniform vec2 size;
  uniform vec4 leftLens;
  uniform vec4 rightLens;
  uniform vec2 pointer;
  uniform float time;
  varying mediump vec3 light;

  void main() {
    float t = rim.x;
    float lens = rim.z;
    vec4 shape = mix(leftLens, rightLens, lens);
    float compact = 1.0 - smoothstep(420.0, 680.0, size.x);
    float across = mix(t, 1.0 - t, lens);
    float sweep = across * 3.8 - time * 0.89 + lens * 1.7 + pointer.x * 0.24;
    float glint = smoothstep(-0.13, 1.0, cos(sweep));
    float flex = sin(across * 2.2 - time * 0.67 + lens * 1.25);
    float fade = smoothstep(0.0, 0.14, t) * (1.0 - smoothstep(0.72, 1.0, t));

    float angle = mix(mix(-1.68, -0.12, t), mix(0.08, 2.32, t), lens);
    vec2 direction = vec2(cos(angle), sin(angle));
    vec2 normal = normalize(direction / shape.zw);
    float curvature = flex * mix(4.4, 2.3, compact) * fade;
    float span = mix(34.0, 47.0, lens) * (1.0 + 0.09 * glint);
    float pointerLift = dot(normal, pointer) * 2.6 * fade;
    vec2 point = shape.xy + direction * shape.zw + normal * (rim.y * span + curvature + pointerLift);
    gl_Position = vec4(point / size * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
    light = vec3(rim.y, (0.64 + 0.26 * glint) * fade, glint);
  }
`;

const fragmentSource = `
  precision mediump float;

  varying mediump vec3 light;
  uniform vec3 paper;
  uniform vec3 oak;

  void main() {
    float offset = light.x;
    float lip = 1.0 - smoothstep(0.014, 0.07, abs(offset));
    float bevel = 1.0 - smoothstep(0.012, 0.07, abs(offset + 0.28));
    float halo = 1.0 - smoothstep(0.07, 0.44, abs(offset));
    float wash = smoothstep(-1.0, -0.31, offset) * (1.0 - smoothstep(-0.22, 0.04, offset));
    float shade = smoothstep(0.05, 0.21, offset) * (1.0 - smoothstep(0.25, 0.92, offset));

    float reflection = min(0.96, light.y * (lip * (0.76 + 0.24 * light.z) + halo * 0.17
                      + wash * 0.28 + bevel * (0.10 + 0.19 * light.z)));
    float undertone = light.y * shade * (0.030 + 0.019 * light.z) * (1.0 - reflection);
    gl_FragColor = vec4(paper * reflection + oak * undertone, reflection + undertone);
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

  const program = createLightProgram(gl, vertexSource, fragmentSource);
  const vertices = gl.createBuffer();
  if (!program || !vertices) return;

  // Each strip covers only the bevel and halo around the visible sweep of a lens.
  const segments = 72;
  const verticesPerLens = (segments + 1) * 2;
  const rims = new Float32Array(verticesPerLens * 2 * 3);
  for (let lens = 0; lens < 2; lens++) {
    for (let index = 0; index <= segments; index++) {
      const parameter = index / segments;
      const offset = (lens * verticesPerLens + index * 2) * 3;
      rims.set([parameter, -1, lens, parameter, 1, lens], offset);
    }
  }

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, rims, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'rim');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

  const size = gl.getUniformLocation(program, 'size');
  const leftLens = gl.getUniformLocation(program, 'leftLens');
  const rightLens = gl.getUniformLocation(program, 'rightLens');
  const pointer = gl.getUniformLocation(program, 'pointer');
  const time = gl.getUniformLocation(program, 'time');
  const palette = getComputedStyle(canvas);
  setLightColor(gl, program, 'paper', palette);
  setLightColor(gl, program, 'oak', palette);

  return {
    resize(waves: HTMLElement, width: number, height: number) {
      const ratio = Math.min(devicePixelRatio, 1.15, 1600 / width);

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(size, width, height);

      // Keep the live lenses anchored to the same circles as the CSS fallback.
      const left = getComputedStyle(waves, '::after');
      const right = getComputedStyle(waves, '::before');
      const leftRadiusX = parseFloat(left.width) / 2;
      const leftRadiusY = parseFloat(left.height) / 2;
      const rightRadiusX = parseFloat(right.width) / 2;
      const rightRadiusY = parseFloat(right.height) / 2;
      gl.uniform4f(leftLens, parseFloat(left.left) + leftRadiusX, parseFloat(left.top) + leftRadiusY,
        leftRadiusX, leftRadiusY);
      gl.uniform4f(rightLens, width - parseFloat(right.right) - rightRadiusX, parseFloat(right.top) + rightRadiusY,
        rightRadiusX, rightRadiusY);
    },
    draw(seconds: number, x: number, y: number) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(time, seconds);
      gl.uniform2f(pointer, x, y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, verticesPerLens);
      gl.drawArrays(gl.TRIANGLE_STRIP, verticesPerLens, verticesPerLens);
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
  let pendingPointer: PointerEvent | undefined;
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
    if (now - lastDraw < 1000 / 60 - 1) return;
    const step = Math.min((now - lastDraw) / 1000, 0.065);
    lastDraw = now;
    time += step;
    if (pendingPointer) {
      const { left, top, width, height } = canvas.getBoundingClientRect();
      targetX = Math.max(-1, Math.min(1, (pendingPointer.clientX - left) / width * 2 - 1));
      targetY = Math.max(-1, Math.min(1, (pendingPointer.clientY - top) / height * 2 - 1));
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
