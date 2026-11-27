export function createLightProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  if (!program) return;

  for (const [kind, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
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

export function setLightColor(gl: WebGLRenderingContext, program: WebGLProgram, name: string, palette: CSSStyleDeclaration) {
  const tint = parseInt(palette.getPropertyValue('--color-' + name).trim().slice(1), 16);
  gl.uniform3f(gl.getUniformLocation(program, name), ((tint >> 16) & 255) / 255, ((tint >> 8) & 255) / 255, (tint & 255) / 255);
}
