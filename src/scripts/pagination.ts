export function createPagination(rail: HTMLElement | null) {
  const markers = [...(rail?.querySelectorAll<HTMLElement>('[data-gallery-dot]') ?? [])];
  if (!rail || !markers.length) return;

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
      active = index;
      markers.forEach((marker, position) => marker.toggleAttribute('data-dot-active', position === active));
      place();
    },
  };
}
