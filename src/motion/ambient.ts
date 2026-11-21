const storageKey = 'el-roble-ambient-paused';

export function setupAmbientMotion() {
  const control = document.querySelector<HTMLButtonElement>('[data-ambient-toggle]');
  if (!control || !('IntersectionObserver' in window)) return;

  const ornaments = document.querySelectorAll<HTMLElement>('[data-ambient]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const pauseLabel = 'Pausar animaciones decorativas';
  const playLabel = 'Reanudar animaciones decorativas';
  let paused = false;

  try {
    paused = localStorage.getItem(storageKey) === 'true';
  } catch {
    // The control also works when storage is unavailable.
  }

  const observer = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      target.toggleAttribute('data-ambient-visible', isIntersecting);
      if (isIntersecting) target.setAttribute('data-ambient-started', '');
    }
  });

  const syncPlayback = () => {
    root.toggleAttribute('data-ambient-paused', paused || document.hidden);
    const label = paused ? playLabel : pauseLabel;
    control.setAttribute('aria-label', label);
    control.title = label;
    control.toggleAttribute('data-show-play', paused);
  };

  const syncPreference = () => {
    control.inert = preference.matches;
    if (preference.matches) {
      observer.disconnect();
      for (const ornament of ornaments) {
        ornament.removeAttribute('data-ambient-visible');
        ornament.removeAttribute('data-ambient-started');
      }
    } else {
      ornaments.forEach((ornament) => observer.observe(ornament));
    }
  };

  control.addEventListener('click', () => {
    paused = !paused;
    syncPlayback();
    try {
      localStorage.setItem(storageKey, String(paused));
    } catch {
      // The preference is still applied for the current page.
    }
  });
  preference.addEventListener('change', syncPreference);
  document.addEventListener('visibilitychange', syncPlayback);

  syncPlayback();
  syncPreference();
}
