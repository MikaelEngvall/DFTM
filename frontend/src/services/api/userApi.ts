import { User, UserRole } from '../../types/user';
import { axiosInstance } from './axiosConfig';

// Typ för backend-användare
interface BackendUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  active: boolean;
  phoneNumber: string | null;
  preferredLanguage?: string;
  password?: string;
}

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
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
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
  requestEmailChange: async (newEmail: string, password: string): Promise<void> => {
    try {
      await axiosInstance.post('/api/v1/auth/request-email-change', {
        newEmail,
        password
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
      
      // Mappa data från backend till frontend-format
      return response.data.map((user: { active: boolean, role: string } & Omit<User, 'isActive' | 'role'>) => {
        // Konvertera från 'ROLE_ADMIN' till 'admin'
        const roleParts = user.role.split('_');
        const frontendRole = roleParts.length > 1 ? roleParts[1].toLowerCase() : user.role.toLowerCase();
        
        return {
          ...user,
          role: frontendRole as UserRole, // Konvertera rollen från 'ROLE_USER' till 'user'
          isActive: user.active
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
      // Mappa 'isActive' från frontend till 'active' i backend
      // och konvertera från 'superadmin' till 'ROLE_SUPERADMIN'
      const backendUser: BackendUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: `ROLE_${user.role.toUpperCase()}`, // Konverterar från t.ex. 'superadmin' till 'ROLE_SUPERADMIN'
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
  }
}; 