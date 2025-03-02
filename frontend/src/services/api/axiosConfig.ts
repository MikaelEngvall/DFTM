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
      console.log(`Debug - API call to ${config.url} with token: ${token.substring(0, 15)}...`);
    } else {
      console.warn(`Debug - API call to ${config.url} without token!`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor för att hantera autentiseringsfel
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API Error: ${error.response.status} - ${error.response.statusText}`, {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data
      });

      // Om svaret är 401 Unauthorized, rensa token och omdirigera till login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Om vi använder React Router kan vi omdirigera här, men nu gör vi en enkel omladdning
        window.location.reload();
      }
      
      // Visa ett mer specifikt meddelande för 403 Forbidden
      if (error.response.status === 403) {
        console.error('403 Forbidden: Du har inte behörighet att utföra denna åtgärd.');
        console.error('Din token kan ha fel roll eller ha utgått.');
        
        // Logga token-information för felsökning (utan att avslöja hela token)
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const [, payload] = token.split('.');
            const decodedPayload = JSON.parse(atob(payload));
            console.log('Token info (delar av payload):', {
              role: decodedPayload.role,
              exp: new Date(decodedPayload.exp * 1000).toLocaleString(),
              sub: decodedPayload.sub
            });
          } catch (e) {
            console.error('Kunde inte avkoda token:', e);
          }
        }
      }
    } else {
      console.error('API Error: Inget svar från servern', error.message);
    }
    
    return Promise.reject(error);
  }
); 