import { en } from '../locales/en.js';
import { es } from '../locales/es.js';

export const translations = {
  en,
  es,
};

let currentLang = (typeof localStorage !== 'undefined' ? localStorage.getItem('inkit_lang') : null) || 'en';
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('inkit_lang', lang);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    applyTranslations();
  }
}

export function getLang() {
  return currentLang;
}

export function t(key) {
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}
window.t = t;

export function applyTranslations() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'number')) {
      if (el.placeholder) el.placeholder = t(key);
    } else {
      let textReplaced = false;
      for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
          child.textContent = t(key);
          textReplaced = true;
          break;
        }
      }
      if (!textReplaced) {
        el.textContent = t(key);
      }
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (key) el.title = t(key);
  });

  document.querySelectorAll('[data-i18n-tooltip]').forEach(el => {
    const key = el.getAttribute('data-i18n-tooltip');
    if (key) el.setAttribute('data-tooltip', t(key));
  });
}
