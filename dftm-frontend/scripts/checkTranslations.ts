import sv from '../src/i18n/locales/sv.json';
import en from '../src/i18n/locales/en.json';
import pl from '../src/i18n/locales/pl.json';
import uk from '../src/i18n/locales/uk.json';

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

const flattenTranslations = (obj: TranslationObject, prefix = ''): string[] => {
  return Object.entries(obj).reduce((acc: string[], [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      return [...acc, newKey];
    }
    return [...acc, ...flattenTranslations(value as TranslationObject, newKey)];
  }, []);
};

const findMissingKeys = (source: string[], target: string[]): string[] => {
  return source.filter(key => !target.includes(key));
};

const checkTranslations = () => {
  const svKeys = flattenTranslations(sv);
  const enKeys = flattenTranslations(en);
  const plKeys = flattenTranslations(pl);
  const ukKeys = flattenTranslations(uk);

  const missingInEn = findMissingKeys(svKeys, enKeys);
  const missingInPl = findMissingKeys(svKeys, plKeys);
  const missingInUk = findMissingKeys(svKeys, ukKeys);

  if (missingInEn.length || missingInPl.length || missingInUk.length) {
    console.error('Missing translations found:');
    if (missingInEn.length) console.error('English:', missingInEn);
    if (missingInPl.length) console.error('Polish:', missingInPl);
    if (missingInUk.length) console.error('Ukrainian:', missingInUk);
    process.exit(1);
  }

  console.log('All translations are complete! ✅');
  process.exit(0);
};

checkTranslations(); 