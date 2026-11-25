import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupScroll } from '../scripts/scroll';
import { gsap } from './gsap';
import { playOpening, revealSections } from './sections';
import { createStory } from './story';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
setupScroll(() => ScrollTrigger.update());

const story = document.querySelector<HTMLElement>('[data-story]');
const stopStory = story ? createStory(story) : undefined;
if (import.meta.hot) import.meta.hot.dispose(() => stopStory?.());

const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const wide = matchMedia('(min-width: 75rem)');
const compact = matchMedia('(max-width: 40rem)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
let active: gsap.Context | undefined;
let frame = 0;

function syncMotion(firstVisit = false) {
  frame = 0;
  active?.revert();
  active = undefined;
  if (motion.matches) {
    active = gsap.context(() => {
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
      };
    });
  }
}

for (const query of [motion, wide, compact, fine]) {
  query.addEventListener('change', () => {
    if (!frame) frame = requestAnimationFrame(() => syncMotion());
  });
}
syncMotion(true);
