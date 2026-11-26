import { createGlass } from '../vendor/liquid-glass/liquid-glass.js';

const reduceTransparency = matchMedia('(prefers-reduced-transparency: reduce), (forced-colors: active)');
const optics = { chroma: 0, bezel: .4, specular: .45, specularWidth: 1.5, lightAngle: -125 };

function setupBackdrop(lens: HTMLElement) {
  let glass: ReturnType<typeof createGlass> | undefined;
  const update = () => {
    if (reduceTransparency.matches || !lens.offsetWidth || !lens.offsetHeight) {
      glass?.destroy();
      glass = undefined;
      return;
    }
    const style = getComputedStyle(lens);
    const radius = parseFloat(style.borderTopLeftRadius);
    const blur = parseFloat(style.getPropertyValue('--optical-frost')) || .7;
    const shape = { radius, refraction: 8, blur };
    if (glass) glass.update(shape);
    else glass = createGlass(lens, { ...optics, ...shape, mode: 'backdrop', fit: true, fallback: 'blur(5px)' });
  };
  const resize = new ResizeObserver(update);
  resize.observe(lens);
  reduceTransparency.addEventListener('change', update);
  return () => {
    resize.disconnect();
    reduceTransparency.removeEventListener('change', update);
    glass?.destroy();
  };
}

function setupImageLenses(stage: HTMLElement) {
  const lenses = [...stage.querySelectorAll<HTMLElement>('[data-optical-source]')].flatMap((element) => {
    const sample = element.querySelector<HTMLElement>('[data-optical-sample]');
    if (!sample) return [];
    const copy = new Image();
    copy.alt = '';
    copy.decoding = 'async';
    sample.append(copy);
    return [{ element, sample, copy, glass: undefined as ReturnType<typeof createGlass> | undefined }];
  });
  const staticImage = stage.querySelector<HTMLImageElement>('[data-glass-image]');
  const hasBranchLens = lenses.some(({ element }) => element.dataset.opticalSource === 'branch');
  let frame = 0;
  let visible = false;

  const draw = () => {
    frame = 0;
    // Keep the live image visible during a dissolve or the opening zoom.
    const source = staticImage ?? (stage.querySelector('[data-photo-state="leaving"], [data-photo-moving]')
      ? null
      : stage.querySelector<HTMLImageElement>('[data-photo-state="active"] img'));
    const image = source?.complete && source.naturalWidth ? source : null;
    const rect = image?.getBoundingClientRect();
    const style = image && getComputedStyle(image);
    for (const lens of lenses) {
      const { element, sample, copy } = lens;
      const box = element.getBoundingClientRect();
      if (!visible || reduceTransparency.matches || !image || !rect || !style || !box.width
        || box.right <= rect.left || box.left >= rect.right || box.bottom <= rect.top || box.top >= rect.bottom) {
        sample.removeAttribute('data-optical-ready');
        lens.glass?.destroy();
        lens.glass = undefined;
        continue;
      }

      const sampleBox = sample.getBoundingClientRect();
      const scaleX = sampleBox.width / sample.offsetWidth;
      const scaleY = sampleBox.height / sample.offsetHeight;
      const shape = {
        x: (box.left - sampleBox.left) / scaleX,
        y: (box.top - sampleBox.top) / scaleY,
        width: element.offsetWidth,
        height: element.offsetHeight,
        radius: parseFloat(getComputedStyle(element).borderTopLeftRadius),
      };
      if (copy.src !== image.currentSrc) copy.src = image.currentSrc;
      copy.style.width = `${rect.width / scaleX}px`;
      copy.style.height = `${rect.height / scaleY}px`;
      copy.style.transform = `translate(${(rect.left - sampleBox.left) / scaleX}px, ${(rect.top - sampleBox.top) / scaleY}px)`;
      copy.style.objectFit = style.objectFit;
      copy.style.objectPosition = style.objectPosition;
      copy.style.opacity = style.opacity;
      if (lens.glass) lens.glass.update(shape);
      else lens.glass = createGlass(sample, { ...optics, ...shape, refraction: hasBranchLens ? 13 : 11, blur: hasBranchLens ? 1.2 : 1 });
      sample.toggleAttribute('data-optical-ready', copy.complete && copy.naturalWidth > 0 && copy.currentSrc === image.currentSrc);
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  intersection.observe(stage);
  const resize = new ResizeObserver(schedule);
  resize.observe(stage);
  if (staticImage?.parentElement && staticImage.parentElement !== stage) resize.observe(staticImage.parentElement);
  for (const lens of lenses) {
    resize.observe(lens.element);
    lens.copy.addEventListener('load', schedule);
  }
  const state = !staticImage || hasBranchLens ? new MutationObserver(schedule) : undefined;
  state?.observe(stage, {
    subtree: true, attributes: true, attributeFilter: hasBranchLens ? ['open'] : ['data-photo-state', 'data-photo-moving'],
  });
  stage.addEventListener('load', schedule, true);
  stage.addEventListener('transitionend', schedule);
  window.addEventListener('resize', schedule, { passive: true });
  reduceTransparency.addEventListener('change', schedule);

  return () => {
    cancelAnimationFrame(frame);
    intersection.disconnect();
    resize.disconnect();
    state?.disconnect();
    stage.removeEventListener('load', schedule, true);
    stage.removeEventListener('transitionend', schedule);
    window.removeEventListener('resize', schedule);
    reduceTransparency.removeEventListener('change', schedule);
    for (const { glass, copy } of lenses) {
      copy.removeEventListener('load', schedule);
      copy.remove();
      glass?.destroy();
    }
  };
}

const cleanups = [
  ...Array.from(document.querySelectorAll<HTMLElement>('[data-optical-glass]:not([data-optical-source])'), setupBackdrop),
  ...Array.from(document.querySelectorAll<HTMLElement>('[data-glass-scene]'), setupImageLenses),
];
if (import.meta.hot) import.meta.hot.dispose(() => cleanups.forEach((cleanup) => cleanup()));
