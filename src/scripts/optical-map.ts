const neutralChannel = 128;
const maxChannelOffset = 127;
const profileSteps = 512;
const lightDirection = -125 * Math.PI / 180;
const lightX = Math.cos(lightDirection);
const lightY = Math.sin(lightDirection);
const rimWidth = 1.5;
const rimBrightness = .45;
const cacheLimit = 48;

interface OpticalMap {
  url: string;
  decoded: boolean;
  ready: Promise<void>;
}

const cache = new Map<string, OpticalMap>();
let bendProfile: Float32Array | undefined;

function sampleBendProfile() {
  // Slope of a fourth-power superellipse, then Snell's law for an index of 1.5.
  let peak = 0;
  const values = Float32Array.from({ length: profileSteps + 1 }, (_, step) => {
    const distance = Math.min(step / profileSteps, 1 - 1e-6);
    const base = 1 - distance;
    const slope = base ** 3 * Math.max(1 - base ** 4, 1e-9) ** -.75;
    const incidence = Math.atan(slope);
    const transmission = Math.asin(Math.sin(incidence) / 1.5);
    const offset = Math.tan(incidence - transmission);
    peak = Math.max(peak, offset);
    return offset;
  });
  return values.map((value, step) => step === profileSteps ? 0 : value / peak);
}

function drawMap(width: number, height: number, radius: number, density: number) {
  const canvas = document.createElement('canvas');
  const columns = Math.max(2, Math.round(width * density));
  const rows = Math.max(2, Math.round(height * density));
  canvas.width = columns;
  canvas.height = rows;
  // A map is written once and encoded immediately. Use the Canvas 2D readback path.
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return;

  const bitmap = context.createImageData(columns, rows);
  const stepX = width / columns;
  const stepY = height / rows;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const cornerRadius = Math.max(0, Math.min(radius, halfWidth, halfHeight));
  const curvedEdge = Math.max(.5, .4 * Math.min(halfWidth, halfHeight));
  const activeRim = Math.max(curvedEdge, 5 * rimWidth);
  const feather = Math.max(stepX, stepY);
  const profile = bendProfile ??= sampleBendProfile();

  // Red and green encode displacement, blue encodes the highlight, alpha clips the lens.
  let pixel = 0;
  for (let row = 0; row < rows; row++) {
    const y = (row + .5) * stepY - halfHeight;
    const vertical = Math.abs(y) - (halfHeight - cornerRadius);
    for (let column = 0; column < columns; column++, pixel += 4) {
      const x = (column + .5) * stepX - halfWidth;
      const horizontal = Math.abs(x) - (halfWidth - cornerRadius);
      const isCorner = horizontal > 0 && vertical > 0;
      const edge = isCorner ? Math.hypot(horizontal, vertical) : Math.max(horizontal, vertical);
      const inset = cornerRadius - edge;
      const coverage = Math.min(1, .5 + inset / feather);
      if (coverage <= 0) continue;

      let red = neutralChannel;
      let green = neutralChannel;
      let blue = neutralChannel;
      if (inset < activeRim) {
        const normalX = isCorner ? horizontal / edge : Number(horizontal > vertical);
        const normalY = isCorner ? vertical / edge : Number(vertical >= horizontal);
        const signX = x > 0 ? 1 : -1;
        const signY = y > 0 ? 1 : -1;
        const distanceInside = Math.max(0, inset);
        const depth = distanceInside / curvedEdge;
        const bend = profile[Math.min(profileSteps, Math.round(depth * profileSteps))];
        red -= signX * Math.round(maxChannelOffset * bend * normalX);
        green -= signY * Math.round(maxChannelOffset * bend * normalY);

        const line = Math.max(0, 1 - distanceInside / rimWidth);
        const glow = Math.max(0, 1 - distanceInside / (5 * rimWidth));
        const incidence = signX * normalX * lightX + signY * normalY * lightY;
        const lighting = .12 + .88 * (incidence > 0 ? incidence : -.4 * incidence);
        blue += Math.round(maxChannelOffset * rimBrightness * (line * line + .3 * glow * glow) * lighting);
      }
      bitmap.data[pixel] = red;
      bitmap.data[pixel + 1] = green;
      bitmap.data[pixel + 2] = blue;
      bitmap.data[pixel + 3] = Math.round(coverage * 255);
    }
  }
  context.putImageData(bitmap, 0, 0);
  return canvas.toDataURL('image/png');
}

export function getOpticalMap(width: number, height: number, radius: number, density: number) {
  const key = [width, height, radius, density].join(':');
  const cached = cache.get(key);
  if (cached) {
    cache.delete(key);
    cache.set(key, cached);
    return cached;
  }

  const url = drawMap(width, height, radius, density);
  if (!url) return;
  const image = new Image();
  image.src = url;
  const map: OpticalMap = {
    url,
    decoded: false,
    ready: image.decode().then(() => {
      map.decoded = true;
    }, () => {
      if (cache.get(key) === map) cache.delete(key);
    }),
  };
  if (cache.size >= cacheLimit) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, map);
  return map;
}
