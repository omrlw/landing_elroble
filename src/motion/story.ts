import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, gsap } from './gsap';

const cinema = '(prefers-reduced-motion: no-preference) and (orientation: landscape) and (min-width: 60rem) and (min-height: 40rem)';

export function createStory(section: HTMLElement) {
  const stage = section.querySelector<HTMLElement>('[data-story-stage]');
  const backdrop = section.querySelector('[data-story-backdrop]');
  const title = section.querySelector('[data-story-title]');
  const discovery = section.querySelector('[data-story-discovery]');
  const encounter = section.querySelector('[data-story-encounter]');
  const resolution = section.querySelector('[data-story-resolution]');
  const portrait = section.querySelector<HTMLElement>('[data-story-portrait]');
  const clay = portrait?.querySelector('img');
  const group = section.querySelector('[data-story-group]');
  const groupPhoto = group?.querySelector('img');
  if (!stage || !backdrop || !title || !discovery || !encounter || !resolution || !portrait || !clay || !group || !groupPhoto) return;

  const header = document.querySelector<HTMLElement>('[data-site-header]');
  const media = gsap.matchMedia();

  media.add(cinema, (context) => {
    let active = true;
    let waitForExit: IntersectionObserver | undefined;
    let fragmentTimer = 0;
    for (const photo of [clay, groupPhoto]) photo.loading = 'eager';

    const mount = () => {
      context.add(() => {
        section.setAttribute('data-story-playing', '');

        gsap.set(portrait, {
          '--story-mask-top': '53%',
          '--story-mask-side': '1.5%',
          '--story-mask-bottom': '7%',
          yPercent: -18,
        });
        gsap.set(clay, { scale: 1.08 });
        gsap.set(title, { opacity: .7, y: 12 });

        const timeline = gsap.timeline({ paused: true, defaults: { ease: ease.dissolve } });
        // Timeline positions represent percentages of the pinned scroll distance.
        timeline.to({}, { duration: 100 }, 0)
          .addLabel('expectativa', 0)
          .to(title, { opacity: 1, y: 0, duration: 10, ease: ease.settle }, 'expectativa')
          .addLabel('descubrimiento', 20)
          .to(title, { opacity: 0, y: -10, duration: 8 }, 'descubrimiento')
          .to(portrait, {
            '--story-mask-top': '0%',
            '--story-mask-side': '0%',
            '--story-mask-bottom': '0%',
            yPercent: 0,
            duration: 20,
          }, 'descubrimiento')
          .to(clay, { scale: 1, duration: 20 }, 'descubrimiento')
          .fromTo(discovery, { y: 10 }, { opacity: 1, y: 0, duration: 9 }, 30)
          .addLabel('encuentro', 55)
          .to(discovery, { opacity: 0, y: -8, duration: 5 }, 52)
          .to(group, { opacity: 1, duration: 11 }, 'encuentro')
          .to(portrait, { opacity: 0, duration: 9 }, 'encuentro+=2')
          .fromTo(encounter, { y: 8 }, { opacity: 1, y: 0, duration: 7 }, 62)
          .addLabel('resolucion', 85)
          .to([encounter, group], { opacity: 0, duration: 7 }, 'resolucion')
          .to(backdrop, { opacity: 0, duration: 10 }, 'resolucion')
          .fromTo(resolution, { y: 10 }, { opacity: 1, y: 0, duration: 6 }, 93);

        const trigger = ScrollTrigger.create({
          id: 'story',
          animation: timeline,
          trigger: section,
          start: () => `top ${header?.offsetHeight ?? 0}px`,
          end: () => `+=${section.offsetHeight - stage.offsetHeight}`,
          scrub: .2,
        });

        let headerHeight = header?.offsetHeight ?? 0;
        const resize = new ResizeObserver(() => {
          const height = header?.offsetHeight ?? 0;
          if (height === headerHeight) return;
          headerHeight = height;
          trigger.refresh();
        });
        if (header) resize.observe(header);

        return () => {
          resize.disconnect();
          section.removeAttribute('data-story-playing');
        };
      });
    };

    function mountWhenClear() {
      window.clearTimeout(fragmentTimer);
      document.removeEventListener('scrollend', mountWhenClear);
      const { top, bottom } = section.getBoundingClientRect();
      if (top >= window.innerHeight || bottom <= (header?.offsetHeight ?? 0)) {
        mount();
        return;
      }

      waitForExit = new IntersectionObserver(([entry]) => {
        if (!active || entry.isIntersecting) return;
        waitForExit?.disconnect();
        mount();
      }, { rootMargin: `-${header?.offsetHeight ?? 0}px 0px 0px` });
      waitForExit.observe(section);
    }

    // Keep the static essay while the assets load and for any reading already in progress.
    void Promise.all([clay.decode(), groupPhoto.decode(), document.fonts.ready]).then(() => {
      if (!active) return;

      const fragment = document.getElementById(location.hash.slice(1));
      const followsStory = fragment && !!(section.compareDocumentPosition(fragment) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (followsStory && fragment.getBoundingClientRect().top > (header?.offsetHeight ?? 0) + 12) {
        // Reflowing the scene can interrupt the browser's initial smooth fragment navigation.
        document.addEventListener('scrollend', mountWhenClear, { once: true });
        fragmentTimer = window.setTimeout(mountWhenClear, 1500);
        return;
      }
      mountWhenClear();
    }, () => {});

    return () => {
      active = false;
      window.clearTimeout(fragmentTimer);
      document.removeEventListener('scrollend', mountWhenClear);
      waitForExit?.disconnect();
    };
  });

  return () => media.revert();
}
