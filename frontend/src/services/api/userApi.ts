import { User, UserRole } from '../../types/user';
import { axiosInstance } from './axiosConfig';

// Backend User interface
interface BackendUser {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  role: string | null;
  active: boolean | null;
  preferredLanguage?: string | null;
  password?: string;
}

// Konvertera backend-roll till frontend-roll
const convertBackendRole = (role: string | null): UserRole => {
  if (!role) {
    return 'ROLE_USER' as UserRole; // Default till ROLE_USER om role är null eller tom
  }
  
  // Godkänn endast giltiga roller direkt
  if (role === 'ROLE_USER' || role === 'ROLE_ADMIN' || role === 'ROLE_SUPERADMIN') {
    return role as UserRole;
  }
  
  // Om rollen mot förmodan saknar prefix, lägg till det för bakåtkompatibilitet
  if (!role.startsWith('ROLE_')) {
    const roleWithPrefix = `ROLE_${role.toUpperCase()}`;
    console.warn("Konverterade roll från oväntad format:", role, "till:", roleWithPrefix);
    return roleWithPrefix as UserRole;
  }
  
  // Fallback om det är en annan roll med ROLE_-prefix
  console.warn("Okänd roll:", role, "använder ROLE_USER");
  return 'ROLE_USER' as UserRole;
};

// Konvertera frontend-roll till backend-roll
export const convertToBackendRole = (role: string): string => {
  if (!role.startsWith('ROLE_')) {
    return `ROLE_${role.toUpperCase()}`;
  }
  return role;
};

// Interceptor för att lägga till JWT token i headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API service
export const userApi = {
  // Hämta den inloggade användaren
  getLoggedInUser: async (): Promise<User | null> => {
    try {
      // Kontrollera först om token finns
      const token = localStorage.getItem('token');
      if (!token) {

        return null;
      }
      
      const response = await axiosInstance.get('/auth/me');
      const userData = response.data;

      // Säkerställ att userData.role är en giltig roll eller använd ROLE_USER som default
      let userRole: UserRole = 'ROLE_USER';
      if (userData.role) {
        if (['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERADMIN'].includes(userData.role)) {
          userRole = userData.role as UserRole;
        } else {
          console.warn(`Okänd roll från servern: ${userData.role}, använder ROLE_USER`);
        }
      }

      return {
        ...userData,
        role: userRole,
        isActive: userData.active || false
      };
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Om vi får ett 401 eller 403, ta bort token och returnera null
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          localStorage.removeItem('token');
          return null;
        }
      }
      throw error;
    }
  },

  // Hämta en lista över alla användare
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Hämta en specifik användare med ID
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Uppdatera en användare
  updateUser: async (userData: User): Promise<User> => {
    try {
      // Validera token för bättre felsökning
      const tokenStatus = userApi.validateToken();
      
      if (!tokenStatus.valid) {
        throw new Error(`Ogiltig token: ${tokenStatus.reason}`);
      }
      
      const response = await axiosInstance.patch(`/users/${userData.id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Om felet är ett 403 Forbidden, kontrollera token och behörigheter igen
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: unknown } };
        if (axiosError.response?.status === 403) {
          console.error('403 Förbjuden - kontrollerar token och behörigheter igen:');
          const token = localStorage.getItem('token');
          
          // Logga token-information
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.error('Token payload:', payload);
            } catch (e) {
              console.error('Kunde inte avkoda token:', e);
            }
          }
        }
      }
      
      throw error;
    }
  },

  // Ändra en användares lösenord
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Begär ändring av e-post
  requestEmailChange: async (newEmail: string): Promise<void> => {
    try {
      await axiosInstance.post('/auth/request-email-change', {
        newEmail
      });
    } catch (error) {
      console.error('Error requesting email change:', error);
      throw error;
    }
  },

  // Hämta alla användare
  getUsers: async (): Promise<User[]> => {
    try {
      const response = await axiosInstance.get('/users');
      
      // Skapa frontend-användare från backenddata
      return response.data.map((user: BackendUser) => {
        // Kontrollera att user.active finns
        const isActive = typeof user.active === 'boolean' ? user.active : true;
        
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: convertBackendRole(user.role),
          active: isActive,
          isActive: isActive, // Sätt båda för att stödja alla delar av koden
          preferredLanguage: user.preferredLanguage
        };
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Skapa en ny användare
  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      // Validera token för bättre felsökning
      const tokenStatus = userApi.validateToken();
      
      if (!tokenStatus.valid) {
        throw new Error(`Ogiltig token: ${tokenStatus.reason}`);
      }
      
      if (tokenStatus.role !== 'ROLE_SUPERADMIN') {
        throw new Error(`Fel roll för användarskapande. Har: ${tokenStatus.role}, behöver: ROLE_SUPERADMIN`);
      }
      
      // Se till att rollen är korrekt formatterad (backend förväntar sig ROLE_*)
      let role: string;
      if (user.role && typeof user.role === 'string') {
        role = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role.toUpperCase()}`;
      } else {
        role = 'ROLE_USER';
      }
      
      
      // Mappa 'isActive' från frontend till 'active' i backend
      const backendUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: role,
        active: user.isActive !== undefined ? user.isActive : true,
        phoneNumber: user.phoneNumber || null,
        preferredLanguage: user.preferredLanguage || 'SV'
      };
      
      // VIKTIGA ÄNDRINGAR: 
      // 1. Använd absolut URL istället för relativ
      // 2. Lägg till headers explicit
      // 3. Skicka data i rätt format
      const token = localStorage.getItem('token');
      
      // Använd den absoluta URL:en istället för relativ URL
      const response = await axiosInstance.post('/users', backendUser, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      
      // Mappa 'active' från backend till 'isActive' i frontend
      return {
        ...response.data,
        isActive: response.data.active
      };
    } catch (error) {
      // Förbättrad felhantering för att hjälpa med felsökning
      console.error('Error creating user:', error);
      
      // Om felet är ett 403 Forbidden, kontrollera token och behörigheter igen
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number, data?: unknown } };
        if (axiosError.response?.status === 403) {
          console.error('403 Förbjuden - kontrollerar token och behörigheter igen:');
          const token = localStorage.getItem('token');
          
          // Logga raw token för felsökning (första 10 tecken)
          if (token) {
            console.error(`Token-prefix: ${token.substring(0, 10)}...`);
            
            // Försök att extrahera och logga payloaden
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.error('Token payload:', payload);
            } catch (e) {
              console.error('Kunde inte avkoda token:', e);
            }
          } else {
            console.error('Ingen token hittades!');
          }
        }
      }
      
      throw error;
    }
  },

  // Registrera en ny användare
  register: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ token: string }> => {
    try {
      const response = await axiosInstance.post(
        '/auth/register',
        { firstName, lastName, email, password }
      );
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        return { token };
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Logga in
  login: async (email: string, password: string): Promise<void> => {
    try {
      
      // Normal inloggningsprocess
      const response = await axiosInstance.post('/auth/authenticate', 
        { email, password }
      );
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logga ut
  logout: () => {
    localStorage.removeItem('token');
  },

  // Validera befintlig token och visa detaljerad information
  validateToken: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Ingen token hittades i localStorage');
      return { valid: false, reason: 'Token saknas' };
    }
    
    try {
      // Analysera token för att kontrollera om den är giltig
      // JWT består av 3 delar: header.payload.signature, vi kollar bara payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token har felaktigt format');
        return { valid: false, reason: 'Felaktigt format' };
      }
      
      // Avkoda payload (del 2 av token)
      const payload = JSON.parse(atob(parts[1]));
      
      // Kontrollera om token har gått ut
      const expiryTime = payload.exp * 1000; // JS använder millisekunder
      const currentTime = Date.now();
      const isExpired = currentTime > expiryTime;
   
      
      if (isExpired) {
        console.error('Token har gått ut');
        return { valid: false, reason: 'Token har utgått' };
      }
      
      // Kontrollera om rollen är korrekt format
      if (!payload.role || !payload.role.startsWith('ROLE_')) {
        console.error('Token har ogiltig roll:', payload.role);
        return { valid: false, reason: 'Ogiltig roll' };
      }
      
      // Token är giltig
      return { 
        valid: true, 
        role: payload.role,
        subject: payload.sub,
        expires: new Date(expiryTime).toLocaleString()
      };
    } catch (error) {
      console.error('Fel vid validering av token:', error);
      return { valid: false, reason: 'Kunde inte avkoda token' };
    }
  },
}; 