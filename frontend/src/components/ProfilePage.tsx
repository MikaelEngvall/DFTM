import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { userApi } from '../services/api/userApi';
import { useTranslation } from 'react-i18next';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userApi.getLoggedInUser();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profile.errors.fetchFailed'));
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p>{error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => window.location.reload()}
        >
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4">
        <p>{t('profile.errors.noUserData')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('profile.title')}</h1>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('profile.personalInfo')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.firstName')}</label>
                  <p className="font-medium">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.lastName')}</label>
                  <p className="font-medium">{user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.email')}</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phoneNumber && (
                  <div>
                    <label className="text-sm text-muted-foreground">{t('profile.phone')}</label>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">{t('profile.accountInfo')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.role')}</label>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.preferredLanguage')}</label>
                  <p className="font-medium">{user.preferredLanguage || t('profile.notSpecified')}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.accountStatus')}</label>
                  <p className="font-medium">
                    {user.isActive ? (
                      <span className="text-green-500">{t('profile.status.active')}</span>
                    ) : (
                      <span className="text-destructive">{t('profile.status.inactive')}</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">{t('profile.registered')}</label>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 