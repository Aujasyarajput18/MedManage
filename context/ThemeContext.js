'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'medmanage_theme';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');

  function persistTheme(next) {
    localStorage.setItem(THEME_KEY, next);
    localStorage.removeItem('theme');
    document.documentElement.setAttribute('data-theme', next);
  }

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) || localStorage.getItem('theme') || 'dark';
    setThemeState(saved);
    persistTheme(saved);
  }, []);

  function setTheme(next) {
    setThemeState(next);
    persistTheme(next);
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
