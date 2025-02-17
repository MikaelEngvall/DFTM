import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import svTranslations from './locales/sv.json';
import enTranslations from './locales/en.json';
import plTranslations from './locales/pl.json';
import uaTranslations from './locales/uk-UA.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'sv-SE': { translation: svTranslations },
      'en-GB': { translation: enTranslations },
      'pl-PL': { translation: plTranslations },
      'uk-UA': { translation: uaTranslations }
    },
    fallbackLng: 'sv-SE',
    load: 'currentOnly',
    cleanCode: true,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

// Lyssna på språkändringar och uppdatera dokumentets språk
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n; 