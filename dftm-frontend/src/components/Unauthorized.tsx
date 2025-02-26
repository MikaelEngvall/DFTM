import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {t('unauthorized.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('unauthorized.message')}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('unauthorized.goBack')}
        </button>
      </div>
    </div>
  );
}; 