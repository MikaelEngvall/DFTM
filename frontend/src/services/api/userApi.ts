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
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Kontrollera först om token finns
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Ingen token hittades, användaren är inte inloggad');
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
          console.log('Token är ogiltig eller utgången, tar bort token');
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
      const response = await axiosInstance.get('/api/v1/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Hämta en specifik användare med ID
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await axiosInstance.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Uppdatera en användare
  updateUser: async (userData: User): Promise<User> => {
    try {
      const response = await axiosInstance.put(`/api/v1/users/${userData.id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Ändra en användares lösenord
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await axiosInstance.post('/api/v1/auth/change-password', {
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
      await axiosInstance.post('/api/v1/auth/request-email-change', {
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
      const response = await axiosInstance.get('/api/v1/users');
      return response.data.map((user: BackendUser) => ({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: convertBackendRole(user.role),
        isActive: user.active,
        preferredLanguage: user.preferredLanguage
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Skapa en ny användare
  createUser: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    try {
      // Hantera rollen enkelt utan överdrivet komplex logik
      const role = user.role && user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role.toUpperCase()}`;
      
      console.log('Skapar användare med roll:', role);
      
      // Mappa 'isActive' från frontend till 'active' i backend
      const backendUser: Omit<BackendUser, 'id'> = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: role,
        active: user.isActive,
        phoneNumber: user.phoneNumber || null,
        preferredLanguage: user.preferredLanguage || 'SV'
      };
      
      console.log('Sending user creation request:', backendUser);
      const response = await axiosInstance.post('/users', backendUser);
      console.log('User creation response:', response);
      
      // Mappa 'active' från backend till 'isActive' i frontend
      return {
        ...response.data,
        isActive: response.data.active
      };
    } catch (error) {
      console.error('Error creating user:', error);
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
      console.log('Attempting registration with:', { firstName, lastName, email });
      const response = await axiosInstance.post(
        '/auth/register',
        { firstName, lastName, email, password }
      );
      console.log('Registration response:', response);
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
      console.log('Attempting login with:', { email, password });
      const response = await axiosInstance.post('/auth/authenticate', 
        { email, password }
      );
      console.log('Login response:', response);
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
      
      // Logga information om token
      console.log('Token information:', {
        subject: payload.sub,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000).toLocaleString(),
        expires: new Date(expiryTime).toLocaleString(),
        expired: isExpired,
        timeLeft: isExpired ? 'Utgången' : `${Math.floor((expiryTime - currentTime) / 60000)} minuter kvar`
      });
      
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