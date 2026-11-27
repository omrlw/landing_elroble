interface Arc {
  center: readonly [number, number];
  radius: readonly [number, number];
  angles: readonly [number, number];
  width: number;
  strength: number;
}

export const ambientProfiles = {
  portrait: [
    { center: [-0.12, 0.13], radius: [0.88, 0.84], angles: [-0.08, 1.61], width: 0.096, strength: 0.98 },
  ],
  fan: [
    { center: [-0.10, 0.18], radius: [0.87, 0.77], angles: [-0.12, 1.75], width: 0.080, strength: 0.84 },
    { center: [-0.12, 0.21], radius: [0.72, 0.62], angles: [0.02, 1.32], width: 0.042, strength: 0.47 },
  ],
  rise: [
    { center: [-0.34, 0.79], radius: [1.04, 0.65], angles: [-1.17, 0.14], width: 0.092, strength: 0.82 },
    { center: [-0.35, 0.78], radius: [0.86, 0.55], angles: [-1.05, -0.02], width: 0.046, strength: 0.43 },
  ],
  sweep: [
    { center: [0.38, -0.27], radius: [0.68, 0.98], angles: [0.45, 2.22], width: 0.095, strength: 0.77 },
  ],
  trace: [
    { center: [-0.19, 0.26], radius: [0.87, 0.60], angles: [0.02, 1.55], width: 0.076, strength: 0.73 },
  ],
  corner: [
    { center: [-0.19, 0.74], radius: [0.87, 0.60], angles: [-1.55, -0.02], width: 0.076, strength: 0.86 },
  ],
} satisfies Record<string, readonly Arc[]>;

export type AmbientProfile = keyof typeof ambientProfiles;

export function arcPath({ center, radius, angles }: Arc) {
  const point = (angle: number) => [
    (center[0] + Math.cos(angle) * radius[0]) * 100,
    (center[1] + Math.sin(angle) * radius[1]) * 100,
  ].map((part) => part.toFixed(2)).join(' ');
  return `M ${point(angles[0])} A ${radius[0] * 100} ${radius[1] * 100} 0 0 1 ${point(angles[1])}`;
}

export const ambientVertex = `
  attribute vec2 rim;
  uniform vec4 ellipse;
  uniform vec4 sweep;
  uniform vec3 motion;
  uniform vec2 material;
  varying mediump vec3 light;

  void main() {
    float t = rim.x;
    float angle = mix(sweep.x, sweep.y, t);
    vec2 direction = vec2(cos(angle), sin(angle));
    vec2 normal = normalize(direction / ellipse.zw);
    float phase = t * 4.5 - motion.x * 0.78 + motion.y + motion.z;
    float highlight = smoothstep(-0.22, 0.97, cos(phase));
    float fade = smoothstep(0.0, 0.19, t) * (1.0 - smoothstep(0.76, 1.0, t));
    float ripple = sin(t * 2.75 - motion.x * 0.60 + motion.y) * (0.012 + 0.008 * highlight);
    float width = sweep.z * (0.86 + 0.16 * highlight);
    vec2 point = ellipse.xy + direction * ellipse.zw + normal * (rim.y * width + ripple * fade);
    point.x = mix(point.x, 1.0 - point.x, material.x);
    gl_Position = vec4(point * vec2(2.0, -2.0) + vec2(-1.0, 1.0), 0.0, 1.0);
    light = vec3(rim.y, fade * sweep.w * material.y * (0.53 + 0.43 * highlight), highlight);
  }
`;
