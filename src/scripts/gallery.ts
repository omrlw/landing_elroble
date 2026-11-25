import { createPagination } from './pagination';
import { reducedMotion, setupAutoAdvance } from './autoplay';
import { duration, gsap } from '../motion/gsap';

export function setupRadioGallery(
  surface: HTMLElement,
  controls: HTMLInputElement[],
  scenes: HTMLElement[],
  root = surface,
  onSelect?: (index: number) => void,
) {
  if (controls.length < 2 || scenes.length !== controls.length) return;

  const pagination = createPagination(root.querySelector<HTMLElement>('[data-gallery-pagination]'));
  let selected = Math.max(0, controls.findIndex((control) => control.checked));
  let requested = selected;
  let nextAutomatic = selected;
  let version = 0;
  let outgoing: HTMLElement | undefined;
  let transition: { timeline: gsap.core.Timeline; finished: Promise<void>; complete: () => void } | undefined;
  let gesture: { id: number; x: number; y: number; dragging: boolean } | undefined;

  const photos = scenes.map((scene) => scene instanceof HTMLImageElement ? [scene] : [...scene.querySelectorAll('img')]);
  const desktopMosaic = matchMedia('(min-width: 73rem)');
  const warm = (index: number) => {
    for (const image of photos[index]) {
      if (!image.closest('[data-gallery-extra]') || desktopMosaic.matches) image.loading = 'eager';
    }
  };
  const wrap = (index: number) => (index + scenes.length) % scenes.length;
  const warmNeighbors = () => {
    warm(wrap(selected - 1));
    warm(wrap(selected + 1));
  };

  const setCurrent = (index: number) => {
    selected = index;
    nextAutomatic = index;
    controls[index].checked = true;
    controls.forEach((control, position) => control.toggleAttribute('data-gallery-current', position === index));
    for (const [position, scene] of scenes.entries()) scene.setAttribute('aria-hidden', String(position !== index));
    scenes[index].dataset.photoState = 'active';
    root.dataset.galleryIndex = String(index);
    pagination?.select(index);
    onSelect?.(index);
  };

  const clearTransition = () => {
    const current = transition;
    transition = undefined;
    if (outgoing) delete outgoing.dataset.photoState;
    outgoing = undefined;
    current?.timeline.revert();
    current?.complete();
  };

  const settleTransition = (manual: boolean) => {
    if (!transition) return;
    const { timeline, finished } = transition;
    if (manual) {
      const remaining = timeline.duration() - timeline.time();
      timeline.timeScale(Math.max(1, Math.min(1.45, remaining / duration.gallery)));
    }
    return finished;
  };

  async function select(index: number, stillPlaying?: () => boolean) {
    const currentRequest = ++version;
    requested = index;
    for (const scene of scenes) {
      if (scene.dataset.photoState === 'staged') delete scene.dataset.photoState;
    }
    if (index === selected) {
      controls[selected].checked = true;
      return;
    }

    const scene = scenes[index];
    warm(index);
    if (scene === outgoing) {
      await settleTransition(!stillPlaying);
      if (currentRequest !== version) return;
    }

    scene.dataset.photoState = 'staged';
    const images = photos[index].filter((image) => image.getClientRects().length);
    const ready = await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => resolve(false), 8500);
      void Promise.all(images.map((image) => image.decode())).then(() => resolve(true), () => resolve(false)).finally(() => clearTimeout(timeout));
    });
    if (currentRequest !== version) return;

    // A new selection shortens the active dissolve without jumping between frames.
    const settled = ready && images.length && stillPlaying?.() !== false ? settleTransition(!stillPlaying) : undefined;
    if (settled) await settled;
    if (currentRequest !== version) return;
    if (!images.length || !ready || stillPlaying?.() === false) {
      delete scene.dataset.photoState;
      requested = selected;
      controls[selected].checked = true;
      return;
    }

    const previous = scenes[selected];
    previous.dataset.photoState = 'leaving';
    outgoing = previous;
    setCurrent(index);
    warmNeighbors();
    if (reducedMotion.matches) {
      clearTransition();
      return;
    }

    let complete!: () => void;
    const finished = new Promise<void>((resolve) => { complete = resolve; });
    const timeline = gsap.timeline({ onComplete: clearTransition });
    const tiles = [...scene.querySelectorAll<HTMLElement>('[data-gallery-tile]')]
      .filter((tile) => tile.getClientRects().length);
    const length = stillPlaying ? duration.scene : duration.reveal;
    const stagger = tiles.length > 1 ? .045 : 0;

    timeline.fromTo(tiles.length ? tiles : scene, { opacity: 0 }, {
      opacity: 1, duration: length, stagger, ease: 'sine.inOut',
    }, 0);

    if (tiles.length) {
      timeline.fromTo(images, { scale: 1.045 }, {
        scale: 1, duration: length, stagger, ease: 'power2.out',
      }, 0);
    }
    transition = { timeline, finished, complete };
  }

  const restart = setupAutoAdvance(surface, root, (stillPlaying) => {
    nextAutomatic = wrap(nextAutomatic + 1);
    return select(nextAutomatic, stillPlaying);
  });
  const selectManually = (index: number) => {
    restart();
    void select(index);
  };

  controls.forEach((control, index) => {
    control.setAttribute('data-gallery-bound', '');
    control.addEventListener('change', () => selectManually(index));
    control.addEventListener('focus', warmNeighbors);
  });
  surface.addEventListener('pointerenter', warmNeighbors);
  surface.addEventListener('dragstart', (event) => event.preventDefault());

  surface.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('a, button, label, input')) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dragging: false };
    warmNeighbors();
  });

  surface.addEventListener('pointermove', (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;

    if (!gesture.dragging) {
      if (Math.abs(y) > 10 && Math.abs(y) >= Math.abs(x)) { gesture = undefined; return; }
      if (Math.abs(x) < 10) return;
      gesture.dragging = true;
      surface.setPointerCapture(event.pointerId);
      surface.setAttribute('data-scene-dragging', '');
    }

    if (!reducedMotion.matches) {
      const offset = Math.max(-24, Math.min(24, x * .22));
      surface.style.setProperty('--scene-displacement', `${offset}px`);
    }
  });

  const clearGesture = () => {
    gesture = undefined;
    surface.removeAttribute('data-scene-dragging');
    surface.style.removeProperty('--scene-displacement');
  };
  surface.addEventListener('pointerup', (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const distance = event.clientX - gesture.x;
    const direction = distance < 0 ? 1 : -1;
    const advance = gesture.dragging && Math.abs(distance) >= 35;
    clearGesture();
    if (advance) selectManually(wrap(requested + direction));
  });
  surface.addEventListener('pointercancel', clearGesture);
  surface.addEventListener('lostpointercapture', (event) => { if (event.target === surface) clearGesture(); });
  surface.addEventListener('pointerleave', () => { if (!gesture?.dragging) clearGesture(); });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) clearTransition(); });

  setCurrent(selected);
  surface.setAttribute('data-gallery-ready', '');
}

function addTrackDrag(track: HTMLElement, getStops: () => number[]) {
  let press: { id: number; x: number; left: number; last: number; time: number; speed: number; dragging: boolean } | undefined;
  let suppressClick = false;

  track.setAttribute('data-drag-track', '');
  track.addEventListener('dragstart', (event) => event.preventDefault());

  track.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || track.scrollWidth <= track.clientWidth) return;
    suppressClick = false;
    press = { id: event.pointerId, x: event.clientX, left: track.scrollLeft, last: event.clientX, time: event.timeStamp, speed: 0, dragging: false };
  });

  track.addEventListener('pointermove', (event) => {
    if (!press || press.id !== event.pointerId) return;
    const distance = event.clientX - press.x;
    if (!press.dragging) {
      if (Math.abs(distance) < 7) return;
      press.dragging = true;
      track.setPointerCapture(event.pointerId);
      track.setAttribute('data-track-dragging', '');
    }

    const elapsed = Math.max(1, event.timeStamp - press.time);
    press.speed = (press.last - event.clientX) / elapsed;
    press.last = event.clientX;
    press.time = event.timeStamp;
    track.scrollLeft = press.left - distance;
  });

  const finish = (event: PointerEvent) => {
    if (!press || press.id !== event.pointerId) return;
    const drag = press;
    press = undefined;
    if (!drag.dragging) return;

    suppressClick = true;
    const speed = event.type === 'pointerup' && event.timeStamp - drag.time < 90 ? drag.speed : 0;
    const inertia = reducedMotion.matches ? 0 : Math.max(-track.clientWidth * .55, Math.min(track.clientWidth * .55, speed * 150));
    const projected = track.scrollLeft + inertia;
    const stop = getStops().reduce((best, left) => Math.abs(left - projected) < Math.abs(best - projected) ? left : best);
    track.removeAttribute('data-track-dragging');
    track.scrollTo({ left: stop, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  };

  track.addEventListener('pointerup', finish);
  track.addEventListener('pointercancel', finish);
  track.addEventListener('lostpointercapture', finish);
  track.addEventListener('pointerleave', () => { if (!press?.dragging) press = undefined; });
  track.addEventListener('click', (event) => {
    if (!suppressClick || event.detail === 0) return;
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
}

function snapPositions(slides: readonly HTMLElement[], end: number) {
  const start = slides[0]?.offsetLeft ?? 0;
  return [...new Set([0, ...slides.map((slide) => Math.max(0, Math.min(end, slide.offsetLeft - start))), end])];
}

function nearestStop(stops: readonly number[], left: number) {
  return stops.reduce((closest, stop, index) => Math.abs(stop - left) < Math.abs(stops[closest] - left) ? index : closest, 0);
}

interface TrackOptions {
  playbackArea: HTMLElement;
  pageCount?: () => number;
  readingTime?: number;
}

export function setupSnapTrack(track: HTMLElement, buttons: HTMLButtonElement[], { playbackArea, pageCount, readingTime }: TrackOptions) {
  const slides = [...track.children].filter((node): node is HTMLElement => node instanceof HTMLElement);
  const rail = buttons[0]?.parentElement ?? null;
  const pagination = createPagination(rail);
  let stops = [0];
  let pages = [0];
  let active = 0;
  let reflected = -1;
  let pending: { index: number; left: number } | undefined;
  let frame = 0;
  let direction = 1;

  const reflect = () => {
    frame = 0;
    const left = track.scrollLeft;
    if (pending && Math.abs(pending.left - left) < 2) pending = undefined;
    active = nearestStop(pages, left);
    if (active === reflected) return;
    reflected = active;
    buttons.forEach((button, index) => {
      if (pageCount) button.setAttribute('aria-pressed', String(index === active));
      else if (index === active) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    pagination?.select(active);
    if (!pageCount) slides.forEach((slide, index) => slide.toggleAttribute('data-snapped', index === active));
  };

  const measure = () => {
    const end = Math.max(0, track.scrollWidth - track.clientWidth);
    stops = snapPositions(slides, end);
    const count = pageCount?.() ?? buttons.length;
    pages = pageCount
      ? [...new Set(Array.from({ length: count }, (_, index) => stops[nearestStop(stops, index * end / Math.max(1, count - 1))]))]
      : stops.slice(0, count);
    pending = undefined;
    reflected = -1;
    buttons.forEach((button, index) => { button.hidden = index >= pages.length || end <= 1; });
    if (rail) rail.hidden = end <= 1;
    reflect();
  };

  const goTo = (index: number) => {
    const left = pages[index];
    pending = { index, left };
    track.scrollTo({ left, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  };

  const restart = setupAutoAdvance(track, playbackArea, () => {
    if (pages.length < 2) return;
    if (active === 0) direction = 1;
    if (active === pages.length - 1) direction = -1;
    goTo(active + direction);
  }, readingTime);

  const goManually = (index: number) => {
    restart();
    goTo(index);
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => goManually(index)));
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(reflect); }, { passive: true });
  const interrupt = () => { pending = undefined; };
  track.addEventListener('pointerdown', interrupt);
  track.addEventListener('wheel', interrupt, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.target !== track || pages.length < 2) return;
    const current = pending?.index ?? active;
    const destinations: Record<string, number> = {
      ArrowLeft: Math.max(0, current - 1),
      ArrowRight: Math.min(pages.length - 1, current + 1),
      Home: 0,
      End: pages.length - 1,
    };
    const destination = destinations[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    goManually(destination);
  });

  addTrackDrag(track, () => stops);
  new ResizeObserver(measure).observe(track);
  reducedMotion.addEventListener('change', measure);
  measure();
}
