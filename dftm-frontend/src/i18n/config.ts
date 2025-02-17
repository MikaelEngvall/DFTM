import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { checkTranslations } from './utils/checkTranslations';

import sv from './locales/sv.json';
import en from './locales/en.json';
import pl from './locales/pl.json';
import uk from './locales/uk.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'sv': { translation: sv },
      'en': { translation: en },
      'pl': { translation: pl },
      'uk': { translation: uk }
    },
    fallbackLng: 'sv',
    load: 'currentOnly',
    cleanCode: true,
    plurals: {
      sv: {
        numbers: [1, 2],
        plurals: (n: number) => Number(n != 1)
      },
      en: {
        numbers: [1, 2],
        plurals: (n: number) => Number(n != 1)
      },
      pl: {
        numbers: [1, 2, 5],
        plurals: (n: number) => Number(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)
      },
      uk: {
        numbers: [1, 2, 5],
        plurals: (n: number) => Number(n%10==1 && n%100!=11 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2)
      }
    },
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

if (process.env.NODE_ENV === 'development') {
  checkTranslations();
}

// Lyssna på språkändringar och uppdatera dokumentets språk
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n; 