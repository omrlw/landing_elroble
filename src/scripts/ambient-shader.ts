export const ambientVertex = `
  attribute vec2 position;
  varying vec2 uv;

  void main() {
    uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const ambientFragment = `
  precision mediump float;
  varying vec2 uv;
  uniform float pixels;
  uniform float seconds;
  uniform float scroll;
  uniform vec2 profile;
  uniform float tone;
  uniform float bubbles;
  uniform vec3 paper;
  uniform vec3 sand;
  uniform vec3 oak;
  uniform vec3 forest;
  uniform vec3 action;

  vec4 over(vec4 front, vec4 back) {
    return front + back * (1.0 - front.a);
  }

  vec4 shadeVeil(vec2 p, float phase) {
    float lengthFade = 1.0 - smoothstep(0.05, 0.96, abs(p.y + 0.04));
    float fold = -0.48 + 0.28 * cos(p.y * 1.76 + 0.66) + 0.035 * sin(phase + p.y * 1.6);
    float offset = p.x - fold;
    float tint = smoothstep(-0.18, 0.035, offset) * (1.0 - smoothstep(0.12, 0.58, offset));
    float light = 0.52 + 0.48 * sin(phase - p.y * 2.0);
    float glass = tint * (0.16 + 0.18 * light);
    float rim = (1.0 - smoothstep(0.003, 0.036, abs(offset + 0.012))) * (0.055 + 0.21 * light);
    vec3 body = mix(sand, action, 0.095);
    return vec4(body * glass + paper * rim, glass + rim) * lengthFade;
  }

  vec4 shadeLens(vec2 p, float phase, float halo) {
    float distance = length(p);
    float edge = 0.89;
    float feather = 2.0 / pixels;
    vec2 direction = normalize(vec2(-0.84, -0.38 + 0.48 * sin(phase)));
    float angle = dot(p / max(distance, 0.004), direction);
    float gleam = smoothstep(0.28, 1.0, angle);
    vec2 lightCenter = direction * (0.50 + 0.13 * cos(phase));
    float scattered = 1.0 - smoothstep(0.08, 1.1, length(p - lightCenter));
    float innerLight = clamp(0.36 + 0.42 * dot(p, direction) + 0.22 * scattered, 0.0, 1.0);

    // The slow light source changes the highlights across a stable volume.
    float disk = 1.0 - smoothstep(edge - feather, edge + feather, distance);
    float spill = 1.0 - smoothstep(0.25, edge + 0.045, distance);
    float face = mix(disk, spill, halo);
    float grazing = mix(disk, spill, halo) * smoothstep(edge - 0.20, edge - 0.024, distance);
    float lip = 1.0 - smoothstep(feather * 0.35, feather * 1.45, abs(distance - edge));
    float softShade = (1.0 - smoothstep(edge - 0.06, 1.02, length(p - vec2(0.03, 0.052)))) * (1.0 - disk);

    vec3 neutral = mix(sand, paper, innerLight * 0.82);
    vec3 green = mix(action, paper, 0.18 + innerLight * 0.25);
    vec3 fill = mix(neutral, green, tone);
    vec3 shadowTint = mix(oak, forest, tone);
    float glass = face * mix(0.34 + innerLight * 0.13, 0.21 + innerLight * 0.22, tone);
    float softRim = (1.0 - smoothstep(0.038, 0.14, abs(distance - 0.66))) * gleam * halo;
    float edgeLight = (lip * (1.0 - halo) * (0.045 + 0.33 * gleam) + softRim * (0.045 + 0.055 * scattered)
                      + grazing * (0.014 + 0.045 * gleam)) * mix(1.0, 0.40, tone);
    float shade = softShade * (0.012 + (1.0 - gleam) * 0.025) * (1.0 - tone) * (1.0 - halo);
    return vec4(fill * glass + paper * edgeLight + shadowTint * shade, glass + edgeLight + shade);
  }

  vec4 floatingBubble(vec2 p, float x, float radius, float seed, float speed) {
    float phase = seconds * speed + scroll * 0.16 + seed;
    float age = fract(phase);
    float opacity = smoothstep(0.0, 0.14, age) * (1.0 - smoothstep(0.80, 1.0, age));
    vec2 center = vec2(x + 0.058 * sin(phase * 6.283), 0.83 - 1.62 * age);
    vec2 q = (p - center) / radius;
    float distance = length(q);
    if (distance > 1.22) return vec4(0.0);

    vec2 highlight = normalize(vec2(-0.67, -0.71 + 0.24 * sin(seconds * 0.41 + seed * 8.0)));
    float facingLight = dot(q / max(distance, 0.004), highlight);
    float edge = 1.0 - smoothstep(0.016, max(0.057, 4.0 / (radius * pixels)), abs(distance - 0.96));
    float lightRim = edge * (0.06 + 0.34 * smoothstep(-0.14, 1.0, facingLight));
    float shadowRim = (1.0 - smoothstep(0.035, 0.19, abs(distance - 1.0))) * (0.045 + 0.060 * (1.0 - facingLight));
    float face = (1.0 - smoothstep(0.81, 0.98, distance)) * (0.10 + 0.09 * smoothstep(-0.8, 0.8, facingLight));
    vec3 base = mix(sand, paper, 0.52 + 0.31 * facingLight);
    return vec4(base * face + paper * lightRim + oak * shadowRim, face + lightRim + shadowRim) * opacity;
  }

  void main() {
    vec2 p = (uv - 0.5) * 2.0;
    p.x *= profile.y;
    float phase = seconds * mix(0.24, 0.42, tone) + scroll * 0.95;
    vec4 light = profile.x > 1.5 ? shadeVeil(p, phase) : shadeLens(p, phase, step(0.5, profile.x));
    if (bubbles > 0.5) {
      float offset = profile.y * 0.055;
      light *= 0.70;
      light = over(floatingBubble(p, -0.24, 0.30, 0.43 + offset, 0.075), light);
      light = over(floatingBubble(p, -0.55, 0.145, 0.19 + offset, 0.086), light);
      light = over(floatingBubble(p, -0.60, 0.082, 0.71 + offset, 0.069), light);
    }
    gl_FragColor = light;
  }
`;
