import { setupNavGlass } from './nav-glass';

export function setupHeader(header: HTMLElement) {
  const menu = header.querySelector<HTMLElement>('#opening-menu');
  const trigger = header.querySelector<HTMLButtonElement>('[popovertarget]');
  const closeButton = header.querySelector<HTMLButtonElement>('[data-nav-close]');
  if (!menu || !trigger) return;

  const desktop = matchMedia('(min-width: 73rem)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let restoreFocusOnClose = false;

  const setMenuExpanded = (open: boolean) => trigger.setAttribute('aria-expanded', String(open));

  if ('showPopover' in menu) {
    const syncNavigation = () => {
      if (desktop.matches) {
        if (menu.matches(':popover-open')) {
          restoreFocusOnClose = false;
          menu.hidePopover();
        }
        menu.removeAttribute('popover');
      } else {
        menu.setAttribute('popover', 'auto');
      }
      setMenuExpanded(false);
    };

    menu.addEventListener('toggle', (event) => {
      const open = menu.matches(':popover-open');
      setMenuExpanded(open);
      if (open) {
        restoreFocusOnClose = true;
        if (event instanceof ToggleEvent && event.newState === 'open') {
          requestAnimationFrame(() => closeButton?.focus({ preventScroll: true }));
        }
      } else if (restoreFocusOnClose && !desktop.matches) {
        restoreFocusOnClose = false;
        trigger.focus({ preventScroll: true });
      }
    });

    closeButton?.addEventListener('click', () => {
      if (menu.matches(':popover-open')) {
        restoreFocusOnClose = true;
        menu.hidePopover();
      }
    });

    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a') && menu.matches(':popover-open')) {
        restoreFocusOnClose = false;
        menu.hidePopover();
      }
    });

    desktop.addEventListener('change', syncNavigation);
    syncNavigation();
  }

  // Desktop dropdown submenu disclosure & hover intent
  const group = menu.querySelector<HTMLElement>('[data-nav-group]');
  const groupTrigger = group?.querySelector<HTMLButtonElement>('[data-nav-trigger]');
  const groupPanel = group?.querySelector<HTMLElement>('[data-nav-panel]');
  let dismissedWhileHovering = false;
  let openedByHover = false;

  const setSubmenuOpen = (open: boolean, viaHover = false) => {
    if (!group || !groupTrigger) return;
    openedByHover = open && viaHover;
    group.toggleAttribute('data-open', open);
    groupTrigger.setAttribute('aria-expanded', String(open));
  };

  if (group && groupTrigger && groupPanel) {
    groupTrigger.addEventListener('click', () => {
      if (!desktop.matches) return;
      dismissedWhileHovering = false;
      const isOpen = group.hasAttribute('data-open');
      if (isOpen && openedByHover) {
        // Clicking an already hover-opened trigger pins it open instead of closing.
        setSubmenuOpen(true, false);
        return;
      }
      setSubmenuOpen(!isOpen, false);
    });

    group.addEventListener('pointerenter', (event) => {
      if (!desktop.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
      if (!dismissedWhileHovering && !group.hasAttribute('data-open')) {
        setSubmenuOpen(true, true);
      }
    });

    group.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      dismissedWhileHovering = false;
      if (desktop.matches && !group.contains(document.activeElement)) setSubmenuOpen(false);
    });

    group.addEventListener('focusout', (event) => {
      if (!desktop.matches) return;
      const nextFocus = event.relatedTarget;
      if (!(nextFocus instanceof Node) || !group.contains(nextFocus)) {
        setSubmenuOpen(false);
      }
    });

    groupPanel.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) {
        dismissedWhileHovering = true;
        setSubmenuOpen(false);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!desktop.matches || !group.hasAttribute('data-open')) return;
      if (!(event.target instanceof Node) || !group.contains(event.target)) {
        setSubmenuOpen(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !desktop.matches || !group.hasAttribute('data-open')) return;
      dismissedWhileHovering = true;
      setSubmenuOpen(false);
      groupTrigger.focus({ preventScroll: true });
    });

    desktop.addEventListener('change', () => {
      dismissedWhileHovering = false;
      setSubmenuOpen(false);
    });
  }

  // Collapse within the first 112px, with a gentle start and finish.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const setGlassAnchor = setupNavGlass(menu, reducedMotion);
  let expanded = 1;

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).flatMap((link) => {
    const section = document.getElementById(link.hash.slice(1));
    return section ? [{ link, section }] : [];
  });
  let height = header.getBoundingClientRect().height;
  let frame = 0;
  let current: HTMLAnchorElement | undefined;
  let currentGroup: HTMLElement | undefined;

  const update = () => {
    frame = 0;
    const scrollY = window.scrollY;
    const progress = Math.min(1, Math.max(0, (scrollY - 8) / 104));
    const nextExpanded = reducedMotion.matches
      ? Number(progress < 0.5)
      : 1 - progress * progress * (3 - 2 * progress);
    const boundary = height + 14;
    const visible = links.find(({ section }) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= boundary && rect.bottom > boundary;
    });
    const atEnd = document.documentElement.scrollHeight - scrollY <= window.innerHeight + 3;
    const next = visible?.link ?? (atEnd ? links.at(-1)?.link : undefined);

    if (nextExpanded !== expanded) {
      expanded = nextExpanded;
      header.style.setProperty('--site-header-expanded', String(expanded));
    }
    if (current !== next) {
      current?.removeAttribute('aria-current');
      currentGroup?.removeAttribute('data-current-group');

      next?.setAttribute('aria-current', 'location');
      const nextGroup = next?.closest<HTMLElement>('[data-nav-group]') ?? undefined;
      nextGroup?.setAttribute('data-current-group', '');
      setGlassAnchor(nextGroup ? groupTrigger ?? undefined : next);

      current = next;
      currentGroup = nextGroup;
    }
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const measure = () => {
    height = header.getBoundingClientRect().height;
    schedule();
  };

  new ResizeObserver(measure).observe(header);
  reducedMotion.addEventListener('change', schedule);
  window.addEventListener('scroll', schedule, { passive: true });
  measure();
}
