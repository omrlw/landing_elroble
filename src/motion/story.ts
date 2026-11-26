import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ease, gsap } from './gsap';

const allowMotion = '(prefers-reduced-motion: no-preference)';
const cinema = '(min-width: 62rem) and (min-height: 42rem) and (orientation: landscape)';

export function createStory(section: HTMLElement) {
  const reel = section.querySelector<HTMLElement>('[data-story-reel]');
  const scenes = [...section.querySelectorAll<HTMLElement>('[data-story-scene]')];
  const images = scenes.map((scene) => scene.querySelector<HTMLImageElement>('[data-story-image]'));
  const copies = scenes.map((scene) => scene.querySelector<HTMLElement>('[data-story-copy]'));
  const frames = scenes.map((scene) => scene.querySelector<HTMLElement>('[data-story-frame]'));
  const [hands, workshop, table] = scenes;
  const [portrait, activity, group] = images;
  const [openingCopy, workshopCopy, tableCopy] = copies;
  const [portraitFrame, , tableFrame] = frames;
  const detail = section.querySelector<HTMLElement>('[data-story-detail]');
  const detailImage = detail?.querySelector('img');
  const visit = section.querySelector<HTMLElement>('[data-story-visit]');
  const cues = [...section.querySelectorAll<HTMLElement>('[data-story-cue]')];
  const links = [...section.querySelectorAll<HTMLElement>('[data-story-link], [data-story-visit]')];

  if (!reel || !hands || !workshop || !table || !portrait || !activity || !group
    || !openingCopy || !workshopCopy || !tableCopy || !portraitFrame || !tableFrame || !detail || !visit) return;

  const media = gsap.matchMedia();
  media.add({ allowMotion, cinema }, ({ conditions }) => {
    if (!conditions?.allowMotion) return;

    if (!conditions.cinema) {
      gsap.fromTo(portrait, { scale: 1.09 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: portraitFrame, start: 'top 95%', end: 'center 44%', scrub: 0.42 },
      });

      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: tableFrame, start: 'top 96%', end: 'top 38%', scrub: 0.42 },
      })
        .fromTo(tableFrame, {
          clipPath: 'inset(5% 15% 9% 15% round var(--story-radius))',
        }, {
          clipPath: 'inset(0% 0% 0% 0% round var(--story-radius))',
        }, 0)
        .fromTo(group, { scale: 1.09 }, { scale: 1 }, 0);
      return;
    }

    const destinations = [workshop, table, visit];
    const chapterStops = [0.45, 0.9, 0.94];
    const initialCue = destinations.findIndex((destination) => location.hash === '#' + destination.id);
    // Clipped panels cannot intersect the viewport until their transition begins.
    activity.loading = 'eager';
    group.loading = 'eager';
    if (detailImage) detailImage.loading = 'eager';
    section.setAttribute('data-story-cinema', '');

    // Native fragment links land on the settled frames along the scroll track.
    cues.forEach((cue, index) => {
      cue.id = destinations[index].id;
      destinations[index].removeAttribute('id');
      cue.style.setProperty('--cue-progress', String(chapterStops[index]));
    });

    let activeChapter = -1;
    function syncChapter(index: number) {
      if (index === activeChapter) return;
      activeChapter = index;
      links.forEach((link, linkIndex) => { link.inert = index !== linkIndex; });
    }
    syncChapter(0);

    const timeline = gsap.timeline({
      defaults: { ease: 'sine.inOut' },
      scrollTrigger: {
        trigger: reel,
        start: () => 'top ' + getComputedStyle(document.documentElement).scrollPaddingTop,
        end: 'bottom bottom',
        scrub: 0.48,
      },
    });

    timeline
      // Move from the detail to the workshop, then open the frame to the group.
      .to(detail, { yPercent: -16, scale: 1.05, duration: 0.23 }, 0.04)
      .to(portrait, { scale: 1.11, duration: 0.31 }, 0.05)
      .to(openingCopy, { y: -14, opacity: 0, duration: 0.17 }, 0.14)
      .to(workshop, { '--story-reveal': '0%', duration: 0.29 }, 0.13)
      .fromTo(activity, { scale: 1.095, yPercent: 2 }, { scale: 1, yPercent: 0, duration: 0.29 }, 0.13)
      .fromTo(workshopCopy, { y: 24, opacity: 0 }, { y: 0, opacity: 1, ease: ease.settle, duration: 0.13 }, 0.32)
      .to(workshopCopy, { y: -12, opacity: 0, duration: 0.15 }, 0.47)
      .to(table, { '--story-reveal-top': '0%', '--story-reveal-bottom': '0%', '--story-reveal-inline': '0%', duration: 0.29 }, 0.54)
      .fromTo(group, { scale: 1.16 }, { scale: 1, duration: 0.46 }, 0.54)
      .fromTo(tableCopy, { y: 22, opacity: 0 }, { y: 0, opacity: 1, ease: ease.settle, duration: 0.13 }, 0.75)
      .fromTo(visit, { y: 14, opacity: 0 }, { y: 0, opacity: 1, ease: ease.settle, duration: 0.14 }, 0.83)
      .eventCallback('onUpdate', () => {
        const progress = timeline.progress();
        syncChapter(progress < 0.16 ? 0 : progress >= 0.41 && progress < 0.49 ? 1 : progress >= 0.89 ? 2 : -1);
      });

    const frame = requestAnimationFrame(() => {
      if (initialCue >= 0) cues[initialCue]?.scrollIntoView({ behavior: 'instant' });
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(frame);
      activity.loading = 'lazy';
      group.loading = 'lazy';
      if (detailImage) detailImage.loading = 'lazy';
      section.removeAttribute('data-story-cinema');
      cues.forEach((cue, index) => {
        destinations[index].id = cue.id;
        cue.removeAttribute('id');
        cue.style.removeProperty('--cue-progress');
      });
      links.forEach((link) => { link.inert = false; });
    };
  });

  return () => media.revert();
}
