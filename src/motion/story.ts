import { ease, gsap } from './gsap';

const cinematic = '(min-width: 60rem) and (min-height: 40rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function createStory(section: HTMLElement) {
  const scene = section.querySelector<HTMLElement>('[data-story-scene]');
  const aperture = section.querySelector<HTMLElement>('[data-story-aperture]');
  const camera = section.querySelector<HTMLImageElement>('[data-story-camera]');
  if (!scene || !aperture || !camera) return;

  const media = gsap.matchMedia();
  media.add(cinematic, () => {
    const timeline = gsap.timeline({
      defaults: { duration: .54, ease: ease.dissolve },
      scrollTrigger: {
        trigger: scene,
        start: () => {
          const header = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop);
          return `top ${header + 24}px`;
        },
        end: () => `+=${Math.round(gsap.utils.clamp(300, 460, scene.offsetHeight * .75))}`,
        pin: true,
        scrub: true,
      },
    });

    // Keep both ends still, especially the portrait before the pin releases.
    timeline.to({}, { duration: 1, ease: 'none' })
      .fromTo(aperture, {
        clipPath: 'inset(45% 13% 0% 7% round var(--story-radius))',
      }, {
        clipPath: 'inset(0% 0% 0% 0% round var(--story-radius))',
        clearProps: 'clipPath',
      }, .08)
      .fromTo(camera, { scale: 1.29 }, { scale: 1 }, '<');
  });

  return () => media.revert();
}
