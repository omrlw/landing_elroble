import { gsap } from '../motion/gsap';

export function setupNavGlass(menu: HTMLElement, reducedMotion: MediaQueryList) {
  const rail = menu.querySelector<HTMLElement>('[data-nav-rail]');
  const lens = menu.querySelector<HTMLElement>('[data-nav-lens]');
  if (!rail || !lens) return () => {};

  let anchor: HTMLElement | undefined;

  const position = (animate: boolean) => {
    const previous = animate && !lens.hidden && !reducedMotion.matches ? lens.getBoundingClientRect() : undefined;
    gsap.killTweensOf(lens);
    gsap.set(lens, { clearProps: 'transform' });

    if (!anchor || !rail.offsetWidth) {
      lens.hidden = true;
      return;
    }

    const origin = rail.getBoundingClientRect();
    const target = anchor.getBoundingClientRect();
    Object.assign(lens.style, {
      left: `${target.left - origin.left}px`,
      top: `${target.top - origin.top}px`,
      width: `${target.width}px`,
      height: `${target.height}px`,
    });
    lens.hidden = false;

    // Animate only the visual transform; the optics map keeps its final dimensions.
    if (previous?.width) {
      gsap.fromTo(lens, {
        x: previous.left - target.left,
        y: previous.top - target.top,
        scaleX: previous.width / target.width,
        scaleY: previous.height / target.height,
      }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .48, ease: 'power3.out', clearProps: 'transform' });
    }
  };

  new ResizeObserver(() => position(false)).observe(rail);
  reducedMotion.addEventListener('change', () => position(false));

  return (next?: HTMLElement) => {
    if (next === anchor) return;
    anchor = next;
    position(true);
  };
}
