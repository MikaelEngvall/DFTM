import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import svTranslations from './locales/sv.json';
import plTranslations from './locales/pl.json';
import ukTranslations from './locales/uk.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      sv: {
        translation: svTranslations,
      },
      pl: {
        translation: plTranslations,
      },
      uk: {
        translation: ukTranslations,
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 