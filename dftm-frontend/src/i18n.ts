import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './i18n/locales/en.json';
import translationSV from './i18n/locales/sv.json';
import translationPL from './i18n/locales/pl.json';
import translationUK from './i18n/locales/uk.json';

const resources = {
  en: {
    translation: translationEN
  },
  sv: {
    translation: translationSV
  },
  pl: {
    translation: translationPL
  },
  uk: {
    translation: translationUK
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 