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
    // Skippa token för auth-relaterade endpoints
    if (config.url?.includes('/auth/authenticate') || config.url?.includes('/auth/register')) {
      return config;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log(`Debug - API call to ${config.url} with token: ${token.substring(0, 15)}...`, {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token.substring(0, 10)}...`
        },
        data: config.data ? JSON.stringify(config.data).substring(0, 100) + '...' : 'None'
      });
    } else {
      console.warn(`Debug - API call to ${config.url} without token!`, {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`
      });
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
        url: error.config.url,
        method: error.config.method,
        data: error.config.data
      });
      
      // Hantera 401 Unauthorized fel
      if (error.response.status === 401) {
        console.error('401 Unauthorized - Token är ogiltig eller utgången');
        localStorage.removeItem('token');
        // Om vi är i en webbläsarmiljö, redirecta användaren vid behov
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          // Men undvik redirect om vi redan försöker logga in
          const isAuthEndpoint = error.config.url.includes('/auth/');
          if (!isAuthEndpoint) {
            console.log('Omdirigerar till startsidan pga. ogiltiga användaruppgifter');
            // Vi använder redirect direkt bara för svåra auth-fel
            // För andra fall låter vi komponenterna själva hantera navigeringen
          }
        }
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
    } else if (error.request) {
      // Request gjordes men inget svar mottogs
      console.error('Nätverksfel - Inget svar från servern', {
        url: error.config.url,
        method: error.config.method
      });
      
      // Lägg till mer användbara felmeddelanden för frontend
      error.message = "Kunde inte nå servern. Kontrollera din internetanslutning och försök igen.";
    } else {
      // Något gick fel vid uppsättning av requesten
      console.error('Fel vid uppsättning av API-anrop:', error.message);
    }
    
    return Promise.reject(error);
  }
); 