import { getOpticalMap } from './optical-map';

const agent = navigator.userAgent;
export const supportsBackdropRefraction = /(?:Chrome|Chromium|Edg)\//.test(agent);
const isGecko = /Firefox\//.test(agent);
const isWebKit = !supportsBackdropRefraction && !isGecko && /AppleWebKit\//.test(agent);
const definitions = document.querySelector<SVGDefsElement>('[data-optical-defs]')!;
const template = document.querySelector<HTMLTemplateElement>('[data-optical-filter]')!
  .content.querySelector('filter')!;
let nextFilterId = 0;

interface LensRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

function setRegion(element: SVGElement, x: number, y: number, width: number, height: number) {
  element.setAttribute('x', String(x));
  element.setAttribute('y', String(y));
  element.setAttribute('width', String(width));
  element.setAttribute('height', String(height));
}

export function mountOpticalFilter(surface: HTMLElement, mode: 'photo' | 'backdrop') {
  const filter = template.cloneNode(true) as SVGFilterElement;
  const mapImage = filter.querySelector('feImage')!;
  const blur = filter.querySelector('feGaussianBlur')!;
  const displacement = filter.querySelector('feDisplacementMap')!;
  const correction = filter.querySelector<SVGFEColorMatrixElement>('[data-axis-correction]')!;
  if (!isWebKit) {
    correction.remove();
    displacement.setAttribute('in2', 'field');
  }
  const lensRegions = filter.querySelectorAll<SVGElement>('[data-lens-rect]');
  const strength = mode === 'backdrop' ? 8 : 11;
  const styleKey = mode === 'backdrop' ? 'backdropFilter' : 'filter';
  const baseId = `optical-filter-${++nextFilterId}`;
  let revision = 0;
  let wanted = '';
  let mapUrl: string | undefined;
  let timers: number[] = [];

  function paint() {
    // WebKit can retain a stale feImage result after a map or geometry change.
    if (isWebKit) filter.id = `${baseId}-${++revision}`;
    if (!filter.parentNode) {
      if (!filter.id) filter.id = baseId;
      definitions.append(filter);
    }
    const reference = `url(#${filter.id})`;
    if (surface.style[styleKey] !== reference) surface.style[styleKey] = reference;
  }

  return {
    update(lens: LensRect, surfaceWidth: number, surfaceHeight: number, frost: number) {
      if (Math.min(lens.width, lens.height, surfaceWidth, surfaceHeight) < 1) return;

      const dpr = window.devicePixelRatio || 1;
      const snap = (pixels: number) => Math.round(pixels * dpr) / dpr;
      const x = snap(lens.x);
      const y = snap(lens.y);
      const width = snap(lens.width);
      const height = snap(lens.height);
      const key = [surfaceWidth, surfaceHeight, x, y, lens.width, lens.height, lens.radius, frost, dpr].join(':');
      if (key === wanted) return;
      wanted = key;

      const map = getOpticalMap(lens.width, lens.height, lens.radius, Math.min(dpr, 2));
      if (!map) return;

      const apply = () => {
        if (wanted !== key || !map.decoded) return;
        const mapChanged = map.url !== mapUrl;
        if (mapChanged) {
          mapUrl = map.url;
          mapImage.setAttribute('href', map.url);
        }

        for (const region of lensRegions) {
          setRegion(region, x / surfaceWidth, y / surfaceHeight, width / surfaceWidth, height / surfaceHeight);
        }
        // Engines convert a bounding-box scale into pixel offsets using different axes.
        let scaleBasis = surfaceWidth;
        if (isGecko) scaleBasis = Math.sqrt((surfaceWidth ** 2 + surfaceHeight ** 2) / 2);
        if (isWebKit) {
          scaleBasis = Math.min(surfaceWidth, surfaceHeight);
          const scaleX = scaleBasis / surfaceWidth;
          const scaleY = scaleBasis / surfaceHeight;
          correction.setAttribute('values', `${scaleX} 0 0 0 ${(1 - scaleX) / 2} 0 ${scaleY} 0 0 ${(1 - scaleY) / 2} 0 0 1 0 0 0 0 0 1 0`);
        }
        displacement.setAttribute('scale', String(2 * strength / scaleBasis));

        const padding = Math.ceil(strength + 3 * frost);
        blur.setAttribute('stdDeviation', `${frost / surfaceWidth} ${frost / surfaceHeight}`);
        setRegion(blur, (x - padding) / surfaceWidth, (y - padding) / surfaceHeight,
          (width + 2 * padding) / surfaceWidth, (height + 2 * padding) / surfaceHeight);
        paint();

        if (isWebKit && mapChanged) {
          timers.forEach(clearTimeout);
          timers = [60, 250].map((delay) => window.setTimeout(paint, delay));
        }
      };
      if (map.decoded) apply();
      else void map.ready.then(apply);
    },
    destroy() {
      wanted = '';
      timers.forEach(clearTimeout);
      surface.style[styleKey] = '';
      filter.remove();
    },
  };
}
