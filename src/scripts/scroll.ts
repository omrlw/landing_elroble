import type Lenis from 'lenis';

export function setupScroll(onScroll: () => void) {
  const smooth = matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');
  const listeners = new AbortController();
  const { signal } = listeners;
  let lenis: Lenis | undefined;

  const sync = async () => {
    if (!smooth.matches) {
      lenis?.destroy();
      lenis = undefined;
      return;
    }

    try {
      const { default: Lenis } = await import('lenis');
      if (signal.aborted || !smooth.matches || lenis) return;
      lenis = new Lenis({ autoRaf: true, allowNestedScroll: true });
      lenis.on('scroll', onScroll);
    } catch {
      // The page can still scroll natively if Lenis fails to load.
    }
  };
  smooth.addEventListener('change', sync, { signal });
  void sync();

  window.addEventListener('click', (event) => {
    if (!lenis?.isSmooth || event.defaultPrevented || event.button !== 0) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!(event.target instanceof Element) || !event.target.closest('a[href^="#"]')) return;

    // Let the browser follow the fragment with its usual focus and history behavior.
    lenis.stop();
    lenis.start();
  }, { signal });

  return () => {
    listeners.abort();
    lenis?.destroy();
  };
}
