import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { revealSections } from './sections';
import { createStory } from './story';

gsap.registerPlugin(ScrollTrigger);

const media = gsap.matchMedia();
const motion = '(prefers-reduced-motion: no-preference)';
const story = document.querySelector<HTMLElement>('[data-story]');
const initialHash = location.hash;

media.add({
  motion,
  wide: '(min-width: 75rem)',
  storyFits: '(min-height: 35rem), (width < 37.5rem) and (min-height: 29rem)',
}, ({ conditions }) => {
  if (story && conditions?.motion && conditions.storyFits) return createStory(story, Boolean(conditions.wide));
});

// The story adds its scroll space after the HTML arrives, including on deep links.
if (initialHash && story?.hasAttribute('data-story-playing')) {
  document.getElementById(initialHash.slice(1))?.scrollIntoView({ behavior: 'instant' });
}

media.add(motion, () => revealSections());
