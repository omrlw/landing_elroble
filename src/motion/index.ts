import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupScroll } from '../scripts/scroll';
import { reducedMotion } from '../scripts/media';
import { gsap } from './gsap';
import { playOpening, revealSections } from './sections';
import { createStory } from './story';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
const stopScroll = setupScroll(() => ScrollTrigger.update());

const story = document.querySelector<HTMLElement>('[data-story]');
const stopStory = story ? createStory(story) : undefined;
const compact = matchMedia('(max-width: 40rem)');
let active: gsap.Context | undefined;
let frame = 0;

function syncMotion(initial = false) {
  frame = 0;
  active?.revert();
  active = undefined;
  if (!reducedMotion.matches) {
    active = gsap.context(() => {
      const stopOpening = initial ? playOpening(compact.matches) : undefined;
      const stopReveals = revealSections(compact.matches);
      return () => {
        stopOpening?.();
        stopReveals();
      };
    });
  }
}

const queries = [reducedMotion, compact];
function scheduleMotion() {
  if (!frame) frame = requestAnimationFrame(() => syncMotion());
}
for (const query of queries) query.addEventListener('change', scheduleMotion);
syncMotion(true);

if (import.meta.hot) import.meta.hot.dispose(() => {
  for (const query of queries) query.removeEventListener('change', scheduleMotion);
  cancelAnimationFrame(frame);
  active?.revert();
  stopStory?.();
  stopScroll();
});
