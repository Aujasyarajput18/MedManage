'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '@/lib/translations';

const LanguageContext = createContext({
  langCode: 'en',
  setLang: () => {},
  t: () => {},
});

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('app_language');
    if (saved && TRANSLATIONS[saved]) {
      setLangCode(saved);
    }
  }, []);

  const setLang = (code) => {
    if (TRANSLATIONS[code]) {
      setLangCode(code);
      localStorage.setItem('app_language', code);
    }
  };

  const t = (section, key) => {
    if (!mounted) return TRANSLATIONS['en'][section]?.[key] || key;
    return TRANSLATIONS[langCode]?.[section]?.[key] || TRANSLATIONS['en'][section]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ langCode, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
