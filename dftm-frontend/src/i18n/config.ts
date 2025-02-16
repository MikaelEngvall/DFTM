import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import svTranslations from './locales/sv.json';
import enTranslations from './locales/en.json';
import plTranslations from './locales/pl.json';
import uaTranslations from './locales/ua.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sv: { translation: svTranslations },
      en: { translation: enTranslations },
      pl: { translation: plTranslations },
      ua: { translation: uaTranslations }
    },
    fallbackLng: 'sv',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 