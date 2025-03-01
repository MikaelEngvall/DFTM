import axios from 'axios';
import { User, UserRole } from '../../types/user';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

export const userApi = {
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

  // Uppdatera en användare
  updateUser: async (user: User): Promise<User> => {
    try {
      // Mappa 'isActive' från frontend till 'active' i backend
      // och konvertera från 'superadmin' till 'ROLE_SUPERADMIN'
      const backendUser: BackendUser = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: `ROLE_${user.role.toUpperCase()}`, // Konverterar från t.ex. 'admin' till 'ROLE_ADMIN'
        active: user.isActive,
        phoneNumber: user.phoneNumber || null,
        preferredLanguage: user.preferredLanguage
      };
      
      // Om lösenord är angivet, skicka med det
      if (user.password) {
        backendUser.password = user.password;
      }
      
      console.log('Sending user update request:', backendUser);
      const response = await axiosInstance.patch(`/users/${user.id}`, backendUser);
      console.log('User update response:', response);
      
      // Mappa 'active' från backend till 'isActive' i frontend
      return {
        ...response.data,
        isActive: response.data.active
      };
    } catch (error) {
      console.error('Error updating user:', error);
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
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        { firstName, lastName, email, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
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
      const response = await axios.post(`${API_BASE_URL}/auth/authenticate`, 
        { email, password },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true 
        }
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