const revealed = new WeakSet<Element>();
const settle = 'cubic-bezier(.22, .72, .25, 1)';

export function revealSections() {
  const running = new Map<HTMLElement, Animation>();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const element = entry.target as HTMLElement;
      const { top, height } = entry.boundingClientRect;
      if (!entry.isIntersecting || !height) continue;

      revealed.add(element);
      observer.unobserve(element);

      // A fast jump can land beyond the reveal zone in a single frame.
      if (top < window.innerHeight * .63 || element.matches(':focus-within')) continue;
      const card = element.dataset.reveal === 'card';
      const animation = element.animate([
        { opacity: card ? .42 : .62, translate: `0 ${card ? 24 : 14}px` },
        { opacity: 1, translate: '0 0' },
      ], { duration: card ? 1160 : 940, easing: settle });

      running.set(element, animation);
      const forget = () => running.delete(element);
      void animation.finished.then(forget, forget);
    }
  }, { rootMargin: '0px 0px 3% 0px' });

  for (const element of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    if (revealed.has(element)) continue;
    const { top, height } = element.getBoundingClientRect();
    if (height && top < window.innerHeight) {
      revealed.add(element);
      continue;
    }
    observer.observe(element);
  }

  const showFocused = (event: FocusEvent) => {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>('[data-reveal]');
    if (!element) return;
    revealed.add(element);
    observer.unobserve(element);
    running.get(element)?.cancel();
  };

  document.addEventListener('focusin', showFocused);
  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', showFocused);
    for (const animation of running.values()) animation.cancel();
    running.clear();
  };
}
