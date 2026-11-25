import Lenis from 'lenis';

export function setupScroll(onScroll: () => void) {
  const smooth = matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
  let lenis: Lenis | undefined;

  const sync = () => {
    lenis?.destroy();
    lenis = smooth.matches ? new Lenis({ autoRaf: true, allowNestedScroll: true }) : undefined;
    lenis?.on('scroll', onScroll);
  };
  smooth.addEventListener('change', sync);
  sync();

  window.addEventListener('click', (event) => {
    if (!lenis?.isSmooth || event.defaultPrevented || event.button !== 0) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!(event.target instanceof Element) || !event.target.closest('a[href^="#"]')) return;

    // Let the browser follow the fragment with its usual focus and history behavior.
    lenis.stop();
    lenis.start();
  });
}
