import { gsap } from 'gsap';

const handoffs = [
  { start: 2.5, end: 6.5 },
  { start: 9, end: 13.5 },
  { start: 16, end: 20.5 },
] as const;

export function createStory(section: HTMLElement, wide: boolean) {
  const sequence = section.querySelector<HTMLElement>('[data-story-sequence]');
  const presentation = section.querySelector<HTMLElement>('[data-story-presentation]');
  const stage = section.querySelector<HTMLElement>('[data-story-stage]');
  if (!sequence || !presentation || !stage) return;

  const elements = gsap.utils.selector(presentation);
  const captions = elements('[data-story-opening], [data-story-caption]');
  const slides = elements('[data-story-slide]');
  const indicators = elements('[data-story-indicator]');
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const previousSection = document.querySelector<HTMLElement>('[data-trust]');

  const warmImages = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    for (const slide of slides) {
      const photo = slide.querySelector('img');
      if (!photo) continue;
      photo.loading = 'eager';
      void photo.decode().then(() => { slide.setAttribute('data-story-ready', ''); }, () => {});
    }
    observer.disconnect();
  }, { rootMargin: '1000px 0px' });
  warmImages.observe(sequence);

  section.setAttribute('data-story-playing', '');
  const timeline = gsap.timeline({
    defaults: { ease: 'sine.inOut' },
    scrollTrigger: {
      trigger: sequence,
      start: () => `top ${getComputedStyle(presentation).top}`,
      end: () => `+=${sequence.offsetHeight - presentation.offsetHeight}`,
      scrub: .42,
      invalidateOnRefresh: true,
    },
  });

  handoffs.forEach(({ start, end }, index) => {
    const duration = end - start;
    const captionStart = start + duration * (wide && index > 0 ? .56 : .44);
    timeline
      .to(captions[index], { y: -6, opacity: 0, duration: duration * .42 }, start)
      .fromTo(captions[index + 1], { y: 6, opacity: 0 }, {
        y: 0, opacity: 1, duration: end - captionStart, immediateRender: false,
      }, captionStart)
      // Photos stay stacked so a slow or failed request leaves the previous photo in place.
      .to(slides[index + 1], { opacity: 1, duration }, start);

    if (index > 0) {
      timeline
        .to(indicators[index - 1], { opacity: .22, duration }, start)
        .to(indicators[index], { opacity: 1, duration }, start);
    }
  });

  timeline
    .to(elements('[data-story-camera], [data-story-base], [data-story-notch]'), {
      opacity: 0, duration: 2.6,
    }, 4)
    .to(elements('[data-story-screen]'), { scale: 1.05, duration: 2.6 }, 4);

  if (wide) {
    const laptop = elements('[data-story-laptop]');
    const meter = elements('[data-story-indicators]');
    timeline
      .to(laptop, { x: () => stage.clientWidth * .344, scale: .69, duration: 4.5 }, handoffs[1].start)
      .to(meter, { x: () => stage.clientWidth * .344, y: () => stage.clientHeight * -.13, scale: .8, duration: 4.5 }, handoffs[1].start)
      .to(laptop, { x: () => stage.clientWidth * -.057, scale: .57, duration: 4.5 }, handoffs[2].start)
      .to(meter, { x: () => stage.clientWidth * -.057, y: () => stage.clientHeight * -.19, scale: .75, duration: 4.5 }, handoffs[2].start);
  }
  // Leave the final composition on screen before the sticky section releases.
  timeline.to({}, { duration: 3.5 }, handoffs[2].end);

  let refreshFrame = 0;
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => timeline.scrollTrigger?.refresh());
  });
  for (const element of [presentation, header, previousSection]) {
    if (element) resize.observe(element);
  }

  return () => {
    warmImages.disconnect();
    resize.disconnect();
    cancelAnimationFrame(refreshFrame);
    section.removeAttribute('data-story-playing');
  };
}
