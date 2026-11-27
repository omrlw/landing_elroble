interface GlassOptions {
  mode?: 'backdrop' | 'content';
  fallback?: string;
  fit?: boolean;
  hidden?: boolean;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  refraction?: number;
  bezel?: number;
  blur?: number;
  chroma?: number;
  specular?: number;
  specularWidth?: number;
  lightAngle?: number;
}

export const engine: 'blink' | 'gecko' | 'webkit' | 'unknown';

export function createGlass(target: HTMLElement, options?: GlassOptions): {
  update(options: GlassOptions): void;
  destroy(): void;
};
