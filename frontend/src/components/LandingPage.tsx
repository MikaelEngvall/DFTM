import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import blackLogo from '../assets/Transparent Logo Black Text.png';
import whiteLogo from '../assets/Transparent Logo White Text.png';

export const LandingPage = () => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Kontrollera om dark mode är aktiverat
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Kontrollera initialt tema
    checkDarkMode();

    // Skapa en MutationObserver för att lyssna på ändringar i dokumentets class-attribut
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          checkDarkMode();
        }
      });
    });

    // Starta observationen
    observer.observe(document.documentElement, { attributes: true });

    // Rensa upp observern när komponenten avmonteras
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <img
            src={isDarkMode ? whiteLogo : blackLogo}
            alt="DFTASKS Logo"
            className="max-w-xs md:max-w-sm lg:max-w-md h-auto"
          />
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          {t('landingPage.title', 'Välkommen till DFTASKS')}
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('landingPage.description', 'En modern uppgiftshanterare för effektivt samarbete och projektledning.')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            {t('landingPage.buttons.getStarted', 'Kom igång')}
          </button>
          <button className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/90 transition-colors">
            {t('landingPage.buttons.learnMore', 'Läs mer')}
          </button>
        </div>
      </div>
    </div>
  );
}; 