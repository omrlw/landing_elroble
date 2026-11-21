const interval = 8500;

export function setupAutoplay(
  root: HTMLElement,
  surface: HTMLElement,
  progress: HTMLElement | undefined,
  advance: () => Promise<void>,
  warmNeighbors: () => void,
  cancelAdvance: () => void,
) {
  const button = root.querySelector<HTMLButtonElement>('[data-gallery-play]');
  if (!button) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let enabled = !reduced.matches;
  let visible = false;
  let hovering = false;
  let pointer: number | undefined;
  let timer: number | undefined;
  let elapsed = 0;
  let started = 0;
  let advancing = false;
  let fill: Animation | undefined;
  let pointerToggle: boolean | undefined;

  const canRun = () => enabled && visible && !document.hidden && !hovering && pointer === undefined;

  function stop() {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
      elapsed = Math.min(interval, elapsed + performance.now() - started);
    }
    if (advancing && !canRun()) cancelAdvance();
    fill?.pause();
  }

  function tick() {
    timer = undefined;
    elapsed = 0;
    fill?.cancel();
    fill = undefined;
    if (!canRun()) return;
    advancing = true;
    void advance().finally(() => { advancing = false; sync(); });
  }

  function sync() {
    button!.dataset.playState = enabled ? 'playing' : 'paused';
    button!.setAttribute('aria-label', enabled ? 'Pausar carrusel' : 'Reproducir carrusel');
    if (!canRun()) { stop(); return; }
    if (timer !== undefined || advancing) return;

    if (progress && !reduced.matches) {
      fill ??= progress.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: interval, fill: 'both' });
      fill.currentTime = elapsed;
      fill.play();
    }
    started = performance.now();
    timer = window.setTimeout(tick, Math.max(0, interval - elapsed));
  }

  function restartProgress() {
    stop();
    elapsed = 0;
    fill?.cancel();
    fill = undefined;
    sync();
  }

  button.inert = false;
  button.addEventListener('pointerdown', () => { pointerToggle = enabled; });
  button.addEventListener('pointercancel', () => { pointerToggle = undefined; });
  button.addEventListener('click', (event) => {
    enabled = !(event.detail > 0 ? pointerToggle ?? enabled : enabled);
    pointerToggle = undefined;
    if (enabled) restartProgress();
    else sync();
  });

  root.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'touch') return;
    hovering = true;
    sync();
  });
  root.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'touch') return;
    hovering = false;
    sync();
  });
  root.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary) return;
    pointer = event.pointerId;
    sync();
  });
  const release = (event: PointerEvent) => {
    if (pointer !== event.pointerId) return;
    pointer = undefined;
    sync();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', () => { pointer = undefined; hovering = false; sync(); });
  root.addEventListener('focusin', (event) => {
    if (!(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible')) return;
    enabled = false;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => {
    if (reduced.matches) enabled = false;
    restartProgress();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= .3;
    if (visible) warmNeighbors();
    sync();
  }, { threshold: .3, rootMargin: '-72px 0px 0px' }).observe(surface);
  sync();
  return { restartProgress };
}
