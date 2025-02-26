import { useTranslation } from 'react-i18next';

export const Spinner = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500">
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    </div>
  );
}; 