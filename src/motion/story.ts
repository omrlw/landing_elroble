import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, gsap } from './gsap';

const chapters = [
  { label: 'crear', start: 2.5, end: 6.5 },
  { label: 'apoyo', start: 9, end: 13.5 },
  { label: 'compania', start: 16, end: 20.5 },
] as const;

export function createStory(section: HTMLElement, wide: boolean) {
  const sequence = section.querySelector<HTMLElement>('[data-story-sequence]');
  const presentation = section.querySelector<HTMLElement>('[data-story-presentation]');
  const stage = section.querySelector<HTMLElement>('[data-story-stage]');
  const screen = stage?.querySelector('[data-story-screen]');
  if (!sequence || !presentation || !stage || !screen) return;

  const captions = presentation.querySelectorAll('[data-story-opening], [data-story-caption]');
  const slides = presentation.querySelectorAll<HTMLElement>('[data-story-slide]');
  const indicators = [...presentation.querySelectorAll('[data-story-indicator]')];

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
  const timeline = gsap.timeline({ defaults: { ease: ease.dissolve } });
  // The last image gets a reading pause before the next section enters.
  timeline.to({}, { duration: 24 }, 0);
  const distance = wide ? 9 : 5;

  chapters.forEach(({ label, start, end }, index) => {
    const length = end - start;
    timeline.addLabel(label, start);
    timeline.to(captions[index], { opacity: 0, y: -distance, duration: length * .4 }, label);
    timeline.fromTo(captions[index + 1], { opacity: 0, y: distance }, {
      opacity: 1, y: 0, duration: length * .55, immediateRender: false,
    }, start + length * .45);

    // The outgoing image stays behind the incoming one while it decodes and dissolves.
    timeline.to(slides[index + 1], { opacity: 1, duration: length }, label);
    if (index > 0) {
      timeline.to(indicators[index - 1], { opacity: .22, duration: length }, label);
      timeline.to(indicators[index], { opacity: 1, duration: length }, label);
    }
  });

  const frame = stage.querySelectorAll('[data-story-camera], [data-story-base], [data-story-notch]');
  timeline.to(frame, { opacity: 0, duration: 2.6 }, 4)
    .to(screen, { scale: wide ? 1.05 : 1.03, duration: 2.6 }, 4);

  if (wide) {
    const laptop = stage.querySelector('[data-story-laptop]');
    const meter = stage.querySelector('[data-story-indicators]');
    const place = (x: number, y: number, scale: number) => ({
      x: () => stage.clientWidth * x,
      y: () => stage.clientHeight * y,
      scale,
      duration: 4.5,
    });
    if (laptop && meter) {
      timeline.to(laptop, place(.344, 0, .69), 'apoyo')
        .to(meter, place(.344, -.13, .8), 'apoyo')
        .to(laptop, place(-.057, 0, .57), 'compania')
        .to(meter, place(-.057, -.19, .75), 'compania');
    }
  }

  ScrollTrigger.create({
    animation: timeline,
    trigger: sequence,
    start: () => `top ${getComputedStyle(presentation).top}`,
    end: () => `+=${Math.max(1, sequence.offsetHeight - presentation.offsetHeight)}`,
    scrub: true,
    invalidateOnRefresh: true,
  });

  // The sticky scene relies on the actual header height, including after font loading.
  let refreshFrame = 0;
  const resize = new ResizeObserver(() => {
    if (refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      ScrollTrigger.refresh();
    });
  });
  resize.observe(presentation);
  const header = document.querySelector('[data-site-header]');
  if (header) resize.observe(header);

  return () => {
    cancelAnimationFrame(refreshFrame);
    resize.disconnect();
    warmImages.disconnect();
    section.removeAttribute('data-story-playing');
  };
}
