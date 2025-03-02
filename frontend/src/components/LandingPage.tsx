import { useTranslation } from 'react-i18next';

export const LandingPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          {t('landingPage.title')}
        </h1>
        <p className="text-xl mb-8">
          {t('landingPage.subtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">
              {t('landingPage.features.taskManagement.title')}
            </h3>
            <p>
              {t('landingPage.features.taskManagement.description')}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">
              {t('landingPage.features.calendarView.title')}
            </h3>
            <p>
              {t('landingPage.features.calendarView.description')}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">
              {t('landingPage.features.collaboration.title')}
            </h3>
            <p>
              {t('landingPage.features.collaboration.description')}
            </p>
          </div>
        </div>
        
        <div className="mt-16">
          <p className="text-muted-foreground">
            {t('landingPage.loginPrompt')}
          </p>
        </div>
      </div>
    </div>
  );
}; 