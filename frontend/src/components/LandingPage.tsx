import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import LogoDark from '../assets/Transparent Logo White Text.png';
import LogoLight from '../assets/Transparent Logo Black Text.png';

export const LandingPage = () => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Kontrollera om dark mode är aktiverat
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                  window.matchMedia('(prefers-color-scheme: dark)').matches ||
                  localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    
    // Lyssna på tema-ändringar
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logotyp */}
        <div className="flex justify-center mb-8">
          <img 
            src={isDarkMode ? LogoDark : LogoLight} 
            alt="DFTASKS" 
            className="h-48" 
          />
        </div>
        
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
      </div>
    </div>
  );
}; 