'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '@/lib/translations';
import { translateUiText } from '@/lib/uiTranslations';

const LanguageContext = createContext({
  langCode: 'en',
  setLang: () => {},
  t: () => {},
});

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState('en');
  const [mounted, setMounted] = useState(false);
  const textOriginals = useState(() => new WeakMap())[0];
  const textTranslated = useState(() => new WeakMap())[0];
  const attrOriginals = useState(() => new WeakMap())[0];

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

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return undefined;

    const translatableAttrs = ['placeholder', 'aria-label', 'title'];
    let applying = false;

    const isTextBlocked = (node) => {
      const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
      return !element || Boolean(element.closest('script, style, noscript, input, textarea, [data-no-translate]'));
    };

    const isAttrBlocked = (node) => {
      return !node || Boolean(node.closest('script, style, noscript, [data-no-translate]'));
    };

    const translateTextNode = (node) => {
      if (!node.nodeValue || isTextBlocked(node)) return;
      const current = node.nodeValue;
      const lastTranslated = textTranslated.get(node);
      const original = textOriginals.get(node);
      const source = original && current === lastTranslated ? original : current;
      const next = translateUiText(source, langCode);

      textOriginals.set(node, source);
      textTranslated.set(node, next);
      if (current !== next) node.nodeValue = next;
    };

    const translateAttrs = (element) => {
      if (!(element instanceof Element) || isAttrBlocked(element)) return;
      translatableAttrs.forEach((attr) => {
        if (!element.hasAttribute(attr)) return;
        const current = element.getAttribute(attr);
        const attrMap = attrOriginals.get(element) || {};
        const source = attrMap[attr] || current;
        const next = translateUiText(source, langCode);
        attrOriginals.set(element, { ...attrMap, [attr]: source });
        if (current !== next) element.setAttribute(attr, next);
      });
    };

    const translateTree = (root = document.body) => {
      if (!root) return;
      applying = true;
      document.documentElement.lang = langCode;
      document.documentElement.dir = langCode === 'ur' ? 'rtl' : 'ltr';

      if (root.nodeType === Node.TEXT_NODE) {
        translateTextNode(root);
      } else if (root instanceof Element || root instanceof DocumentFragment) {
        if (root instanceof Element) translateAttrs(root);
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let node = walker.nextNode();
        while (node) {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
          else translateAttrs(node);
          node = walker.nextNode();
        }
      }
      applying = false;
    };

    translateTree();

    const observer = new MutationObserver((mutations) => {
      if (applying) return;
      window.requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'characterData') translateTree(mutation.target);
          if (mutation.type === 'attributes') translateTree(mutation.target);
          mutation.addedNodes.forEach((node) => translateTree(node));
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatableAttrs,
    });

    return () => observer.disconnect();
  }, [mounted, langCode, textOriginals, textTranslated, attrOriginals]);

  return (
    <LanguageContext.Provider value={{ langCode, setLang, t, translateText: (text) => translateUiText(text, langCode) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
