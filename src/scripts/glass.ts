import { createGlass, engine } from '../vendor/liquid-glass/liquid-glass.js';

const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)');
const optics = { chroma: 0, bezel: .4, specular: .45, specularWidth: 1.5, lightAngle: -125 };
type Glass = ReturnType<typeof createGlass>;

interface ImageLens {
  element: HTMLElement;
  sample: HTMLElement;
  copy?: HTMLImageElement;
  glass?: Glass;
}

function hideSample(lens: ImageLens) {
  lens.sample.removeAttribute('data-optical-ready');
  lens.glass?.destroy();
  lens.glass = undefined;
}

function drawImageLens(lens: ImageLens, image: HTMLImageElement, rect: DOMRect, style: CSSStyleDeclaration, onLoad: () => void) {
  const { element, sample } = lens;
  const box = element.getBoundingClientRect();
  if (!box.width || !box.height || box.right <= rect.left || box.left >= rect.right
    || box.bottom <= rect.top || box.top >= rect.bottom) {
    hideSample(lens);
    return;
  }

  const sampleBox = sample.getBoundingClientRect();
  if (!sampleBox.width || !sampleBox.height) {
    hideSample(lens);
    return;
  }
  const scaleX = sampleBox.width / sample.offsetWidth;
  const scaleY = sampleBox.height / sample.offsetHeight;
  const shape = {
    x: (box.left - sampleBox.left) / scaleX,
    y: (box.top - sampleBox.top) / scaleY,
    width: element.offsetWidth,
    height: element.offsetHeight,
    radius: parseFloat(getComputedStyle(element).borderTopLeftRadius),
  };

  if (!lens.copy) {
    const copy = new Image();
    copy.alt = '';
    copy.decoding = 'async';
    copy.addEventListener('load', onLoad);
    sample.append(copy);
    lens.copy = copy;
  }
  const copy = lens.copy;
  if (copy.src !== image.currentSrc) copy.src = image.currentSrc;
  copy.style.width = `${rect.width / scaleX}px`;
  copy.style.height = `${rect.height / scaleY}px`;
  copy.style.transform = `translate(${(rect.left - sampleBox.left) / scaleX}px, ${(rect.top - sampleBox.top) / scaleY}px)`;
  copy.style.objectFit = style.objectFit;
  copy.style.objectPosition = style.objectPosition;
  copy.style.opacity = style.opacity;

  if (lens.glass) lens.glass.update(shape);
  else lens.glass = createGlass(sample, { ...optics, ...shape, refraction: 11, blur: 1 });
  sample.toggleAttribute('data-optical-ready', copy.complete && copy.naturalWidth > 0 && copy.currentSrc === image.currentSrc);
}

function setupGlass() {
  const resizeHandlers = new Map<Element, () => void>();
  const resize = new ResizeObserver((entries) => {
    for (const { target } of entries) resizeHandlers.get(target)?.();
  });
  const watchSize = (target: Element, update: () => void) => {
    resizeHandlers.set(target, update);
    resize.observe(target);
    return () => {
      resize.unobserve(target);
      resizeHandlers.delete(target);
    };
  };

  const activate = new Map<Element, () => () => void>();
  const active = new Map<Element, () => void>();
  // Prepare the optical layer shortly before it enters the viewport.
  const intersection = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting, boundingClientRect } of entries) {
      if (isIntersecting && boundingClientRect.width && boundingClientRect.height) {
        const start = activate.get(target);
        if (start && !active.has(target)) active.set(target, start());
      } else {
        active.get(target)?.();
        active.delete(target);
      }
    }
  }, { rootMargin: '120px 0px' });
  const watchVisibility = (target: Element, start: () => () => void) => {
    activate.set(target, start);
    intersection.observe(target);
  };

  // Resize, image load and gallery state can all arrive in the same frame.
  const pending = new Set<() => void>();
  let frame = 0;
  const schedule = (draw: () => void) => {
    pending.add(draw);
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      const draws = [...pending];
      pending.clear();
      for (const draw of draws) draw();
    });
  };
  const activeScenes = new Set<() => void>();
  const onResize = () => activeScenes.forEach(schedule);
  window.addEventListener('resize', onResize, { passive: true });

  // Other engines get the native CSS blur without setting up backdrop lenses.
  if (engine === 'blink') {
    for (const lens of document.querySelectorAll<HTMLElement>('[data-optical-glass]:not([data-optical-source])')) {
      watchVisibility(lens, () => {
        let glass: Glass | undefined;
        const draw = () => {
          if (!lens.offsetWidth || !lens.offsetHeight) {
            glass?.destroy();
            glass = undefined;
            return;
          }
          const style = getComputedStyle(lens);
          const shape = {
            radius: parseFloat(style.borderTopLeftRadius),
            blur: parseFloat(style.getPropertyValue('--optical-frost')) || .7,
            refraction: 8,
          };
          if (glass) glass.update(shape);
          else glass = createGlass(lens, { ...optics, ...shape, mode: 'backdrop', fit: true });
        };
        const stopSize = watchSize(lens, () => schedule(draw));
        schedule(draw);
        return () => {
          stopSize();
          pending.delete(draw);
          glass?.destroy();
        };
      });
    }
  }

  for (const stage of document.querySelectorAll<HTMLElement>('[data-glass-scene]')) {
    watchVisibility(stage, () => {
      const lenses = [...stage.querySelectorAll<HTMLElement>('[data-optical-source]')].flatMap((element): ImageLens[] => {
        const sample = element.querySelector<HTMLElement>('[data-optical-sample]');
        return sample ? [{ element, sample }] : [];
      });
      const staticImage = stage.querySelector<HTMLImageElement>('[data-glass-image]');
      const draw = () => {
        // Keep the live photo visible during a dissolve or the opening zoom.
        const source = staticImage ?? (stage.querySelector('[data-photo-state="leaving"], [data-photo-moving]')
          ? null
          : stage.querySelector<HTMLImageElement>('[data-photo-state="active"] img'));
        if (!source?.complete || !source.naturalWidth) {
          lenses.forEach(hideSample);
          return;
        }
        const rect = source.getBoundingClientRect();
        const style = getComputedStyle(source);
        for (const lens of lenses) drawImageLens(lens, source, rect, style, refresh);
      };
      const refresh = () => schedule(draw);
      const stopSize = [stage, ...lenses.map(({ element }) => element), ...(staticImage ? [staticImage] : [])]
        .map((element) => watchSize(element, refresh));
      const state = staticImage ? undefined : new MutationObserver(refresh);
      state?.observe(stage, { subtree: true, attributes: true, attributeFilter: ['data-photo-state', 'data-photo-moving'] });
      const onLoad = ({ target }: Event) => {
        if (target === staticImage || (target instanceof HTMLImageElement && target.closest('[data-photo-state]'))) refresh();
      };
      stage.addEventListener('load', onLoad, true);
      stage.addEventListener('transitionend', refresh);
      activeScenes.add(draw);
      refresh();

      return () => {
        activeScenes.delete(draw);
        pending.delete(draw);
        stopSize.forEach((stop) => stop());
        state?.disconnect();
        stage.removeEventListener('load', onLoad, true);
        stage.removeEventListener('transitionend', refresh);
        for (const lens of lenses) {
          hideSample(lens);
          lens.copy?.removeEventListener('load', refresh);
          lens.copy?.remove();
        }
      };
    });
  }

  return () => {
    intersection.disconnect();
    for (const stop of active.values()) stop();
    resize.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', onResize);
  };
}

let stopGlass: (() => void) | undefined;
function syncPreferences() {
  stopGlass?.();
  stopGlass = reduceTransparency.matches ? undefined : setupGlass();
}

syncPreferences();
reduceTransparency.addEventListener('change', syncPreferences);
if (import.meta.hot) import.meta.hot.dispose(() => {
  reduceTransparency.removeEventListener('change', syncPreferences);
  stopGlass?.();
});
