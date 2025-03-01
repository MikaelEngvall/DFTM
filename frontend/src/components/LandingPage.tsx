import { useTranslation } from 'react-i18next';

export const LandingPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">
          {t('landingPage.title', 'Välkommen till DFTASKS')}
        </h1>
        <p className="text-xl mb-8">
          {t('landingPage.subtitle', 'Det enkla sättet att hantera uppgifter och samarbeta med ditt team.')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">
              {t('landingPage.features.tasks.title', 'Uppgiftshantering')}
            </h3>
            <p>
              {t('landingPage.features.tasks.description', 'Skapa, tilldela och spåra uppgifter enkelt och effektivt.')}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">
              {t('landingPage.features.calendar.title', 'Kalendervy')}
            </h3>
            <p>
              {t('landingPage.features.calendar.description', 'Se alla dina uppgifter i en tydlig kalendervy för enkel planering.')}
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">
              {t('landingPage.features.collaboration.title', 'Samarbete')}
            </h3>
            <p>
              {t('landingPage.features.collaboration.description', 'Samarbeta smidigt med ditt team genom kommentarer och statusuppdateringar.')}
            </p>
          </div>
        </div>
        
        <div className="mt-16">
          <p className="text-muted-foreground">
            {t('landingPage.loginPrompt', 'Logga in för att komma igång.')}
          </p>
        </div>
      </div>
    </div>
  );
}; 