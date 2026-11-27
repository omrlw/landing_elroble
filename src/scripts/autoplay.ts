import { reducedMotion } from './media';

function watchGalleryPlayback(
  surface: HTMLElement,
  area: HTMLElement,
  update: (playing: boolean) => void,
) {
  const button = area.querySelector<HTMLButtonElement>('[data-gallery-playback]');
  if (!button) return;

  let enabled = true;
  let visible = false;
  let hovering = false;
  let pointer: number | undefined;
  let playing = false;

  const sync = () => {
    const focused = document.activeElement;
    const usingKeyboard = focused !== button && area.contains(focused) && focused?.matches(':focus-visible');
    const dialogOpen = area.querySelector('dialog:is(:popover-open, [open])');
    const next = enabled && visible && !reducedMotion.matches && !document.hidden
      && !hovering && pointer === undefined && !usingKeyboard && !dialogOpen;
    if (next === playing) return;
    playing = next;
    update(playing);
  };

  const reflect = () => {
    button.hidden = reducedMotion.matches;
    button.setAttribute('aria-label', enabled ? 'Pausar carrusel' : 'Reproducir carrusel');
    button.toggleAttribute('data-playback-paused', !enabled);
    sync();
  };

  button.addEventListener('click', () => {
    enabled = !enabled;
    reflect();
  });
  area.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch' || hovering) return;
    hovering = true;
    sync();
  });
  area.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return;
    hovering = false;
    sync();
  });
  area.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) return;
    pointer = event.pointerId;
    sync();
  });
  const release = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    pointer = undefined;
    sync();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', () => {
    pointer = undefined;
    hovering = false;
    sync();
  });
  area.addEventListener('focusin', sync);
  area.addEventListener('focusout', () => queueMicrotask(sync));
  for (const dialog of area.querySelectorAll('dialog')) {
    dialog.addEventListener('toggle', sync);
    dialog.addEventListener('close', sync);
  }
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', reflect);
  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .25;
    sync();
  }, { threshold: .25, rootMargin: '-72px 0px 0px' }).observe(surface);
  reflect();
}

export function setupAutoAdvance(
  surface: HTMLElement,
  area: HTMLElement,
  advance: (stillPlaying: () => boolean) => void | Promise<void>,
  delay = 7500,
) {
  let playing = false;
  let advancing = false;
  let timer = 0;
  let revision = 0;

  const restart = () => {
    const version = ++revision;
    clearTimeout(timer);
    if (!playing || advancing) return;
    timer = window.setTimeout(async () => {
      advancing = true;
      try {
        await advance(() => playing && version === revision);
      } finally {
        advancing = false;
        restart();
      }
    }, delay);
  };

  watchGalleryPlayback(surface, area, (active) => {
    playing = active;
    restart();
  });
  return restart;
}
