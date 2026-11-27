export function createPagination(rail: HTMLElement | null) {
  if (!rail) return;
  const markers = rail.querySelectorAll<HTMLElement>('[data-gallery-dot]');
  if (!markers.length) return;

  const indicator = document.createElement('span');
  indicator.className = 'gallery-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  rail.append(indicator);
  rail.setAttribute('data-pagination-ready', '');

  let active = 0;
  const place = () => {
    const marker = markers[active];
    const width = marker?.offsetWidth;
    if (!width) {
      indicator.hidden = true;
      return;
    }
    rail.style.setProperty('--dot-position', `${marker.offsetLeft + width / 2}px`);
    indicator.hidden = false;
  };
  indicator.hidden = true;
  new ResizeObserver(place).observe(rail);

  return {
    select(index: number) {
      if (active !== index) markers[active]?.removeAttribute('data-dot-active');
      active = index;
      markers[active]?.setAttribute('data-dot-active', '');
      place();
    },
  };
}
