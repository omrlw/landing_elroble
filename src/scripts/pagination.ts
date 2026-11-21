const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function createPagination(rail: HTMLElement | null) {
  const markers = [...(rail?.querySelectorAll<HTMLElement>('[data-gallery-dot]') ?? [])];
  if (!rail || !markers.length) return;

  const indicator = document.createElement('span');
  indicator.className = 'gallery-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  const progress = document.createElement('span');
  indicator.append(progress);
  rail.append(indicator);
  rail.setAttribute('data-pagination-ready', '');

  let active = 0;
  const place = () => {
    const marker = markers[active];
    if (!marker?.offsetWidth) return;
    rail.style.setProperty('--dot-position', `${marker.offsetLeft + marker.offsetWidth / 2}px`);
    indicator.hidden = false;
  };
  indicator.hidden = true;
  new ResizeObserver(place).observe(rail);

  const reveal = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    reveal.disconnect();
    if (!reducedMotion.matches) {
      markers.forEach((marker, index) => {
        marker.querySelector<HTMLElement>('[data-gallery-mark]')?.animate(
          [{ scale: '.6', opacity: .45, translate: '0 3px' }, { scale: '1', opacity: 1, translate: '0 0' }],
          { duration: 480, delay: index * 42, easing: 'cubic-bezier(.16, 1, .3, 1)' },
        );
      });
      indicator.animate([{ opacity: .35, scale: '.55 .8' }, { opacity: 1, scale: '1' }], {
        duration: 530, delay: 85, easing: 'cubic-bezier(.16, 1, .3, 1)',
      });
    }
  }, { threshold: .4 });
  reveal.observe(rail);

  return {
    progress,
    select(index: number) {
      active = index;
      markers.forEach((marker, position) => marker.toggleAttribute('data-dot-active', position === active));
      place();
    },
  };
}
