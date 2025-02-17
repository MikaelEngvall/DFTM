import { useTranslation } from 'react-i18next';
import type { TranslationKey } from '../i18n/types';

export const Example = () => {
  const { t } = useTranslation();
  
  // TypeScript kommer nu att ge felmeddelande om nyckeln inte finns
  const text = t('some.invalid.key'); // TS error
  const valid = t('common.save'); // OK
  
  return <div>{valid}</div>;
}; 