import axios from 'axios';
import { User } from '../../types/user';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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
      // Mappa 'active' från backend till 'isActive' i frontend
      return response.data.map((user: { active: boolean } & Omit<User, 'isActive'>) => ({
        ...user,
        isActive: user.active
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Uppdatera en användare
  updateUser: async (user: User): Promise<User> => {
    try {
      // Mappa 'isActive' från frontend till 'active' i backend
      const backendUser = {
        ...user,
        active: user.isActive,
        // Se till att phoneNumber skickas korrekt
        phoneNumber: user.phoneNumber || null
      };
      const response = await axiosInstance.patch(`/users/${user.id}`, backendUser);
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
  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    try {
      const response = await axiosInstance.post('/users', user);
      return response.data;
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