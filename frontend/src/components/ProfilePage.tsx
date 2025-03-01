import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSave, FiAlertTriangle, FiInfo } from 'react-icons/fi';
import { userApi } from '../services/api/userApi';
import { User } from '../types/user';

interface ProfileFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const ProfileField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  disabled = false, 
  placeholder,
  required = false
}: ProfileFieldProps) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-muted-foreground dark:text-gray-300 mb-1">
      {label} {required && <span className="text-destructive">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-input rounded-md bg-background dark:bg-gray-700 dark:text-white text-foreground placeholder-muted-foreground dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      required={required}
    />
  </div>
);

export const ProfilePage = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const [passwordChangeRequested, setPasswordChangeRequested] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const userData = await userApi.getCurrentUser();
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profile.error.fetch'));
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Återställ felmeddelanden när användaren börjar skriva
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    // Generell formulärvalidering
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setError(t('profile.error.requiredFields'));
      return false;
    }

    // Validera e-post format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t('profile.error.invalidEmail'));
      return false;
    }

    // Om lösenordsändring begärs, validera lösenorden
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError(t('profile.error.currentPasswordRequired'));
        return false;
      }
      if (formData.newPassword.length < 6) {
        setError(t('profile.error.passwordTooShort'));
        return false;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError(t('profile.error.passwordMismatch'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validera formuläret
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Kontrollera om email har ändrats
      const isEmailChanged = user?.email !== formData.email;
      // Kontrollera om ett nytt lösenord har angetts
      const isPasswordChanged = formData.newPassword.length > 0;
      
      if (isEmailChanged) {
        // Simulera begäran om e-postbyte (skicka bekräftelselänk via e-post)
        // I produktion skulle detta anropa en backend-endpoint
        setTimeout(() => {
          setEmailChangeRequested(true);
          setSuccess(t('profile.success.emailChangeRequested'));
        }, 1000);
      } else if (isPasswordChanged) {
        // Simulera begäran om lösenordsbyte (skicka återställningslänk via e-post)
        // I produktion skulle detta anropa en backend-endpoint
        setTimeout(() => {
          setPasswordChangeRequested(true);
          setSuccess(t('profile.success.passwordChangeRequested'));
        }, 1000);
      } else {
        // Uppdatera bara namn och telefonnummer
        if (user) {
          const updatedUser = await userApi.updateUser({
            ...user,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
          });
          
          setUser(updatedUser);
          setSuccess(t('profile.success.profileUpdated'));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('profile.error.updateFailed'));
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-start">
          <FiAlertTriangle className="mt-0.5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary text-primary rounded-md flex items-start">
          <FiInfo className="mt-0.5 mr-3 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {emailChangeRequested ? (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">{t('profile.emailChange.title')}</h2>
          <p className="mb-4">{t('profile.emailChange.description')}</p>
          <p className="text-muted-foreground">{t('profile.emailChange.instruction')}</p>
        </div>
      ) : passwordChangeRequested ? (
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">{t('profile.passwordChange.title')}</h2>
          <p className="mb-4">{t('profile.passwordChange.description')}</p>
          <p className="text-muted-foreground">{t('profile.passwordChange.instruction')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label={t('profile.fields.firstName')}
              value={formData.firstName}
              onChange={(value) => handleChange('firstName', value)} 
              required
            />
            <ProfileField 
              label={t('profile.fields.lastName')}
              value={formData.lastName}
              onChange={(value) => handleChange('lastName', value)}
              required
            />
          </div>
          
          <ProfileField 
            label={t('profile.fields.email')}
            value={formData.email}
            onChange={(value) => handleChange('email', value)}
            type="email" 
            required
          />
          
          <div className="text-xs mb-4 text-muted-foreground">
            {t('profile.emailChangeWarning')}
          </div>
          
          <ProfileField 
            label={t('profile.fields.phoneNumber')}
            value={formData.phoneNumber}
            onChange={(value) => handleChange('phoneNumber', value)}
            placeholder="+46701234567"
          />
          
          <h3 className="text-lg font-medium mt-6 mb-4 border-t border-border pt-4">
            {t('profile.passwordChange.sectionTitle')}
          </h3>
          
          <ProfileField 
            label={t('profile.fields.currentPassword')}
            value={formData.currentPassword}
            onChange={(value) => handleChange('currentPassword', value)}
            type="password"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileField 
              label={t('profile.fields.newPassword')}
              value={formData.newPassword}
              onChange={(value) => handleChange('newPassword', value)}
              type="password"
            />
            <ProfileField 
              label={t('profile.fields.confirmPassword')}
              value={formData.confirmPassword}
              onChange={(value) => handleChange('confirmPassword', value)}
              type="password"
            />
          </div>
          
          <div className="text-xs mb-6 text-muted-foreground">
            {t('profile.passwordChangeWarning')}
          </div>
          
          <button
            type="submit"
            className="flex items-center justify-center w-full px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-primary-foreground"></span>
                {t('common.loading')}
              </>
            ) : (
              <>
                <FiSave className="mr-2" />
                {t('common.save')}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}; 