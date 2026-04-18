/* Shared theme switcher: light <-> dark, persisted in localStorage.
   Injects a floating pill into bottom corner. */
(function () {
  const KEY = 'madrasa-theme';
  const html = document.documentElement;

  // Decide initial theme. Respect any existing data-theme if it's light/dark,
  // else read from storage, else default to LIGHT.
  const current = html.getAttribute('data-theme');
  const stored = localStorage.getItem(KEY);
  let initial = 'light';
  if (stored === 'light' || stored === 'dark') initial = stored;
  else if (current === 'light' || current === 'dark') initial = current;
  html.setAttribute('data-theme', initial);

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    render();
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: t } }));
  }

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function mount() {
    if (document.querySelector('.theme-switch')) return;
    const el = document.createElement('div');
    el.className = 'theme-switch';
    el.setAttribute('role', 'group');
    el.setAttribute('aria-label', 'Theme');
    el.innerHTML = `
      <button data-t="light" aria-pressed="false" title="Light mode">${SUN}<span>Light</span></button>
      <button data-t="dark" aria-pressed="false" title="Dark mode">${MOON}<span>Dark</span></button>
    `;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-t]');
      if (b) setTheme(b.getAttribute('data-t'));
    });
    document.body.appendChild(el);
    render();
  }

  function render() {
    const active = html.getAttribute('data-theme');
    document.querySelectorAll('.theme-switch button[data-t]').forEach(b => {
      b.setAttribute('aria-pressed', b.getAttribute('data-t') === active ? 'true' : 'false');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  // Expose for programmatic use
  window.MadrasaTheme = { set: setTheme, get: () => html.getAttribute('data-theme') };
})();
