import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface ProfileProps {
  isDarkMode: boolean;
}

export const Profile = ({ isDarkMode }: ProfileProps) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get<User>('http://localhost:8080/api/v1/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUser(response.data);
        setFormData({
          ...formData,
          name: response.data.name,
          email: response.data.email
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError(t('profile.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8080/api/v1/users/profile',
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setIsEditing(false);
      // Uppdatera user state med ny data
      if (user) {
        setUser({ ...user, name: formData.name, email: formData.email });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(t('profile.updateError'));
    }
  };

  if (isLoading) {
    return <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 m-auto" />;
  }

  if (!user) {
    return <div className="text-red-500 text-center">{t('profile.notFound')}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-[#1a2332]' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {t('profile.title')}
        </h1>

        {error && (
          <div className="text-red-500 text-center p-4 bg-red-100 rounded mb-4">
            {error}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.email')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.currentPassword')}
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('common.save')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.name')}
              </h3>
              <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
            </div>

            <div>
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.email')}
              </h3>
              <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
            </div>

            <div>
              <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {t('profile.role')}
              </h3>
              <p className={`mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.role}</p>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {t('profile.edit')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 