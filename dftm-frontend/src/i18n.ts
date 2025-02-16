import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './translations/en.json';
import translationSV from './translations/sv.json';
import translationPL from './translations/pl.json';
import translationUA from './translations/ua.json';

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
  ua: {
    translation: translationUA
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'sv',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 