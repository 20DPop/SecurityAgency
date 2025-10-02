import axios from 'axios';

// --- BLOC MODIFICAT PENTRU ROBUSTEȚE ---

let baseURL;

// Verificăm dacă suntem în modul de producție.
// Vite setează automat `import.meta.env.PROD` la `true` la build.
if (import.meta.env.PROD) {
  // Suntem în producție (pe Railway)
  // Folosim variabila de mediu setată pe server.
  baseURL = `${import.meta.env.VITE_API_BASE_URL}/api`;
} else {
  // Suntem în dezvoltare (localhost)
  // Folosim o cale relativă pentru a activa proxy-ul din vite.config.js.
  baseURL = '/api';
}

// --- SFÂRȘIT BLOC MODIFICAT ---

const apiClient = axios.create({
  baseURL: baseURL,
});

// Interceptor-ul pentru token rămâne neschimbat
apiClient.interceptors.request.use(
  (config) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('currentUser'));
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (e) {
      console.error("Eroare la preluarea token-ului din localStorage:", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;