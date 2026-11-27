export const lightRimFragment = `
  precision mediump float;

  varying mediump vec3 light;
  uniform vec3 paper;
  uniform vec3 oak;
  uniform float softness;

  float softBand(float value, float center, float core, float outer) {
    return 1.0 - smoothstep(core, outer, abs(value - center));
  }

  void main() {
    float offset = light.x;
    float bright = light.z;
    float face = softBand(offset, -0.23, 0.025, 0.46);
    float lip = softBand(offset, 0.0, 0.013, 0.075);
    float bevel = softBand(offset, -0.25, 0.012, 0.085);
    float caustic = softBand(offset, -0.53, 0.012, 0.063);
    float outside = softBand(offset, 0.22, 0.0, 0.64);
    float detail = 1.0 - softness;

    float reflection = min(0.95, light.y * (face * (0.18 + 0.13 * bright)
      + lip * (0.55 + 0.34 * bright)
      + detail * (bevel * (0.065 + 0.27 * bright) + caustic * 0.12 * bright)));
    float shadow = outside * detail * light.y * (0.034 + 0.028 * bright) * (1.0 - reflection);
    gl_FragColor = vec4(paper * reflection + oak * shadow, reflection + shadow);
  }
`;
