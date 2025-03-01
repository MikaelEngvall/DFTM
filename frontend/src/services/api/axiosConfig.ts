import axios from 'axios';

// Skapa en Axios-instans med basURL och standardinställningar
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor för att lägga till JWT-token till varje utgående förfrågan
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor för att hantera autentiseringsfel
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Om svaret är 401 Unauthorized, rensa token och omdirigera till login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Om vi använder React Router kan vi omdirigera här, men nu gör vi en enkel omladdning
      window.location.reload();
    }
    return Promise.reject(error);
  }
); 