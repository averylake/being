(() => {
  'use strict';
  const preference = matchMedia('(prefers-color-scheme: dark)');
  let saved = null;
  try { saved = localStorage.getItem('accounts-of-being-theme'); } catch {}
  if (!['light', 'dark'].includes(saved)) saved = null;
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.textContent = theme === 'dark' ? 'Light' : 'Dark';
      button.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' appearance');
    }
  }
  apply(saved || (preference.matches ? 'dark' : 'light'));
  preference.addEventListener('change', () => { if (!saved) apply(preference.matches ? 'dark' : 'light'); });
  document.addEventListener('DOMContentLoaded', () => {
    apply(document.documentElement.dataset.theme);
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      saved = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('accounts-of-being-theme', saved); } catch {}
      apply(saved);
    });
  });
})();
