import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { userApi } from '../services/api/userApi';

export const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const userData = await userApi.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av profil');
        console.error('Error fetching profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
          Försök igen
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-4">
        <p>Ingen användarinformation hittades. Vänligen logga in igen.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Min profil</h1>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Personlig information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Förnamn</label>
                  <p className="font-medium">{user.firstName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Efternamn</label>
                  <p className="font-medium">{user.lastName}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">E-post</label>
                  <p className="font-medium">{user.email}</p>
                </div>
                {user.phoneNumber && (
                  <div>
                    <label className="text-sm text-muted-foreground">Telefon</label>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Kontoinformation</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Roll</label>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Föredraget språk</label>
                  <p className="font-medium">{user.preferredLanguage || 'Inte angett'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Kontostatus</label>
                  <p className="font-medium">
                    {user.isActive ? (
                      <span className="text-green-500">Aktiv</span>
                    ) : (
                      <span className="text-destructive">Inaktiv</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Registrerad</label>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('sv-SE')}
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