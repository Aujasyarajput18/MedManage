/**
 * lib/theme.js
 * Theme utility — applies dark/light mode class to <html>.
 * Works alongside ThemeContext.js.
 */

export const THEME_KEY = 'medmanage_theme';

/** Get the saved theme from localStorage, falling back to system preference */
export function getSavedTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // System preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Apply a theme to the <html> element */
export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }
  html.setAttribute('data-theme', theme);
}

/** Save and apply a theme */
export function setTheme(theme) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_KEY, theme);
  }
  applyTheme(theme);
}

/** Toggle between dark and light */
export function toggleTheme() {
  const current = getSavedTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Initialize theme on app load (call in layout.js or _app.js) */
export function initTheme() {
  const theme = getSavedTheme();
  applyTheme(theme);
  return theme;
}
