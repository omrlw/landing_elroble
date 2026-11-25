import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupScroll } from '../scripts/scroll';
import { gsap } from './gsap';
import { playOpening, revealSections } from './sections';
import { createStory } from './story';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
setupScroll(() => ScrollTrigger.update());

const story = document.querySelector<HTMLElement>('[data-story]');
const sequence = story?.querySelector('[data-story-sequence]');
const header = document.querySelector<HTMLElement>('[data-site-header]');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const wide = matchMedia('(min-width: 75rem)');
const compact = matchMedia('(max-width: 40rem)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
const storyFits = matchMedia('(min-height: 35rem), (width < 37.5rem) and (min-height: 29rem)');
let active: gsap.Context | undefined;
let frame = 0;

function syncMotion(firstVisit = false) {
  frame = 0;
  const bounds = firstVisit ? undefined : sequence?.getBoundingClientRect();
  const headerHeight = header?.offsetHeight ?? 0;
  const beyondStory = bounds && bounds.bottom <= headerHeight;
  const storyPlaying = story?.hasAttribute('data-story-playing');
  const showStory = story !== null && motion.matches && storyFits.matches;
  const currentCaption = storyPlaying && !showStory && bounds && bounds.top < headerHeight && !beyondStory
    ? [...(story?.querySelectorAll('[data-story-opening], [data-story-caption]') ?? [])]
      .find((caption) => Number(getComputedStyle(caption).opacity) > .5)
    : undefined;

  active?.revert();
  active = undefined;
  if (motion.matches) {
    active = gsap.context(() => {
      const stopStory = story && showStory ? createStory(story, wide.matches) : undefined;
      const stopOpening = firstVisit ? playOpening(compact.matches) : undefined;
      const stopReveals = revealSections(compact.matches);
      const oak = document.querySelector('.approach-decoration .oak-desktop');
      if (wide.matches && fine.matches && oak) {
        gsap.fromTo(oak, { y: -12 }, {
          y: 18,
          ease: 'none',
          scrollTrigger: { trigger: '#enfoque', start: 'top bottom', end: 'center center', scrub: .3 },
        });
      }
      return () => {
        stopOpening?.();
        stopReveals();
        stopStory?.();
      };
    });
  }

  if (beyondStory && sequence) {
    // Removing or adding the sticky scene should keep the section below it in view.
    const shift = sequence.getBoundingClientRect().bottom - bounds.bottom;
    if (Math.abs(shift) > 1) window.scrollBy({ top: shift, behavior: 'instant' });
  } else if (currentCaption) {
    currentCaption.scrollIntoView({ behavior: 'instant' });
  } else if (firstVisit && location.hash && showStory) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }
}

for (const query of [motion, wide, compact, fine, storyFits]) {
  query.addEventListener('change', () => {
    if (!frame) frame = requestAnimationFrame(() => syncMotion());
  });
}
syncMotion(true);
