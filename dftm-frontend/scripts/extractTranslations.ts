import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const extractKeys = (content: string): string[] => {
  const keys: string[] = [];
  const regex = /t\(['"]([^'"]+)['"]\)/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return keys;
};

const findTranslationKeys = () => {
  const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**'] });
  const allKeys = new Set<string>();

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const keys = extractKeys(content);
    keys.forEach(key => allKeys.add(key));
  });

  return Array.from(allKeys);
};

const generateTemplate = (keys: string[]) => {
  const template: any = {};
  
  keys.forEach(key => {
    const parts = key.split('.');
    let current = template;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = `[${key}]`;
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  });

  return template;
};

const main = () => {
  const keys = findTranslationKeys();
  const template = generateTemplate(keys);
  
  fs.writeFileSync(
    path.join(__dirname, '../src/i18n/locales/template.json'),
    JSON.stringify(template, null, 2)
  );
  
  console.log(`Found ${keys.length} translation keys`);
  console.log('Template file generated at src/i18n/locales/template.json');
};

main(); 