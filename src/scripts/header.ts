export function setupHeader(header: HTMLElement) {
  const menu = header.querySelector<HTMLElement>('#opening-menu');
  const trigger = header.querySelector<HTMLButtonElement>('[popovertarget]');
  if (!menu || !trigger) return;

  const desktop = matchMedia('(min-width: 73rem)');
  if ('showPopover' in menu) {
    const setExpanded = (open: boolean) => trigger.setAttribute('aria-expanded', String(open));
    const syncNavigation = () => {
      if (desktop.matches) {
        if (menu.matches(':popover-open')) menu.hidePopover();
        menu.removeAttribute('popover');
      } else {
        menu.setAttribute('popover', 'auto');
      }
      setExpanded(false);
    };

    menu.addEventListener('toggle', () => setExpanded(menu.matches(':popover-open')));
    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a') && menu.matches(':popover-open')) menu.hidePopover();
    });
    desktop.addEventListener('change', syncNavigation);
    syncNavigation();
  }

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).flatMap((link) => {
    const section = document.getElementById(link.hash.slice(1));
    return section ? [{ link, section }] : [];
  });
  let height = header.getBoundingClientRect().height;
  let frame = 0;
  let current: HTMLAnchorElement | undefined;

  const update = () => {
    frame = 0;
    const scrolled = window.scrollY > 12;
    const boundary = height + 14;
    const visible = links.find(({ section }) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= boundary && rect.bottom > boundary;
    });
    const atEnd = document.documentElement.scrollHeight - window.scrollY <= window.innerHeight + 3;
    const next = visible?.link ?? (atEnd ? links.at(-1)?.link : undefined);

    header.toggleAttribute('data-scrolled', scrolled);
    if (current !== next) {
      current?.removeAttribute('aria-current');
      next?.setAttribute('aria-current', 'location');
      current = next;
    }
  };

  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const measure = () => {
    height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-block-size', `${height}px`);
    schedule();
  };

  new ResizeObserver(measure).observe(header);
  window.addEventListener('scroll', schedule, { passive: true });
  measure();
}
