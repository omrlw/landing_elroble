import { duration, ease, gsap } from './gsap';

const seen = new WeakSet<HTMLElement>();

export function playOpening(compact: boolean) {
  const hero = document.querySelector('.opening-hero');
  const paint = performance.getEntriesByName('first-contentful-paint')[0];
  if (!hero || location.hash || window.scrollY > 24 || (paint && performance.now() - paint.startTime > 220)) return;

  const title = hero.querySelector('#opening-title > span');
  const emphasis = hero.querySelector('#opening-title > em');
  const intro = hero.querySelector('.opening-hero__intro');
  const photos = hero.querySelector('.hero-media__photos');
  if (!title || !emphasis || !intro || !photos) return;

  const finish = () => {
    hero.removeEventListener('focusin', finish);
    opening.revert();
  };
  const opening = gsap.timeline({ defaults: { ease: ease.settle }, onComplete: finish });
  opening.addLabel('title')
    .fromTo(title, { y: compact ? 8 : 14, opacity: .76 }, { y: 0, opacity: 1, duration: duration.reveal }, 'title')
    .fromTo(emphasis, { y: compact ? 6 : 10, opacity: .72 }, { y: 0, opacity: 1, duration: duration.reveal }, 'title+=0.065')
    .fromTo(intro, { y: compact ? 6 : 9, opacity: .8 }, { y: 0, opacity: 1, duration: duration.gallery }, 'title+=0.14');

  if (!compact) opening.fromTo(photos, { scale: 1.035 }, { scale: 1, duration: duration.scene }, 'title+=0.06');
  hero.addEventListener('focusin', finish);
  return finish;
}

function animateReveal(element: HTMLElement, compact: boolean, timeline: gsap.core.Timeline) {
  const visible = <T extends HTMLElement = HTMLElement>(selector: string) => [...element.querySelectorAll<T>(selector)]
    .filter((child) => child.getClientRects().length);
  const lift = (target: HTMLElement | HTMLElement[], y: number, opacity: number, at = 0, length = duration.reveal) => {
    const targets = Array.isArray(target) ? target : [target];
    if (targets.length) timeline.fromTo(targets, { y: compact ? y * .6 : y, opacity }, { y: 0, opacity: 1, duration: length }, at);
  };
  const mask = (photo: HTMLElement, edge: number, horizontal = false) => {
    const radius = getComputedStyle(photo).borderRadius;
    const cut = `${compact ? edge * .65 : edge}%`;
    timeline.fromTo(photo, {
      clipPath: `inset(0 ${horizontal ? cut : '0%'} ${horizontal ? '0%' : cut} 0 round ${radius})`,
    }, { clipPath: `inset(0 0% 0% 0 round ${radius})`, duration: duration.scene, ease: ease.dissolve }, 0);
  };

  switch (element.dataset.reveal) {
    case 'heading': {
      lift(visible(':scope > :is(h2, h3)'), 13, .7);
      lift(visible(':scope > :is(p, div)'), 7, .78, .075, duration.gallery);
      break;
    }
    case 'frame': {
      const [photo] = visible('[data-reveal-image]');
      if (photo && (!(photo instanceof HTMLImageElement) || photo.naturalWidth)) mask(photo, 24, element.classList.contains('tour-photo'));
      lift(visible(':scope > figcaption'), 5, .75, .095, duration.gallery);
      break;
    }
    case 'program': {
      const [photo] = visible<HTMLImageElement>('.program-photo > img');
      if (photo?.naturalWidth) {
        timeline.fromTo(photo, { scale: 1.035, opacity: .68 }, { scale: 1, opacity: 1, duration: duration.reveal }, 0);
      }
      lift(visible('.program-copy'), 7, .76, photo?.naturalWidth ? .055 : 0, duration.gallery);
      break;
    }
    case 'rail': {
      const [track] = visible(':scope > [tabindex]');
      if (track) timeline.fromTo(track, { x: compact ? 5 : 12, opacity: .74 }, { x: 0, opacity: 1, duration: duration.reveal });
      break;
    }
    case 'posters':
      visible(':scope > li').forEach((poster, index) => lift(poster, index === 0 ? 13 : 9, .73, [0, .065, .11, .145][index] ?? .145));
      break;
    default:
      lift(element, 7, .8, 0, duration.gallery);
  }
}

export function revealSections(compact: boolean) {
  const playing = new Map<HTMLElement, gsap.core.Timeline>();
  const finish = (element: HTMLElement) => {
    playing.get(element)?.revert();
    playing.delete(element);
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !entry.boundingClientRect.height) continue;

      const element = entry.target as HTMLElement;
      seen.add(element);
      observer.unobserve(element);
      // Leave content immediately visible on anchor jumps, fast scrolling and keyboard navigation.
      if (entry.boundingClientRect.top < window.innerHeight * .68 || element.matches(':focus-within')) continue;

      const timeline = gsap.timeline({ defaults: { ease: ease.settle }, onComplete: () => finish(element) });
      playing.set(element, timeline);
      animateReveal(element, compact, timeline);
      if (!timeline.duration()) finish(element);
    }
  }, { rootMargin: '0px 0px -32px 0px' });

  for (const element of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    if (seen.has(element)) continue;
    const { top, height } = element.getBoundingClientRect();
    if (height && top < window.innerHeight * .82) seen.add(element);
    else observer.observe(element);
  }

  const showFocused = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>('[data-reveal]');
    if (!element) return;
    seen.add(element);
    observer.unobserve(element);
    finish(element);
  };

  document.addEventListener('focusin', showFocused);
  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', showFocused);
    for (const element of playing.keys()) finish(element);
  };
}
