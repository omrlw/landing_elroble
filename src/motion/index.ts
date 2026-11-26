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
const compact = matchMedia('(max-width: 40rem)');
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
      return () => {
        stopOpening?.();
        stopReveals();
      };
    });
  }
}

for (const query of [motion, compact]) {
  query.addEventListener('change', () => {
    if (!frame) frame = requestAnimationFrame(() => syncMotion());
  });
}
syncMotion(true);
