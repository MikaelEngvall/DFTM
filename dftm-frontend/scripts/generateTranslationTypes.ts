import * as fs from 'fs';
import * as path from 'path';
import sv from '../src/i18n/locales/sv.json';

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

const generateTypes = (obj: TranslationObject, prefix = ''): string[] => {
  return Object.entries(obj).reduce((acc: string[], [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      return [...acc, `'${newKey}'`];
    }
    return [...acc, ...generateTypes(value as TranslationObject, newKey)];
  }, []);
};

const main = () => {
  const keys = generateTypes(sv);
  
  const content = `// This file is auto-generated. Do not edit manually.
export type TranslationKey = ${keys.join(' | ')};

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof import('../src/i18n/locales/sv.json');
    };
  }
}
`;

  fs.writeFileSync(
    path.join(__dirname, '../src/i18n/types.ts'),
    content
  );
  
  console.log('Translation types generated!');
};

main(); 