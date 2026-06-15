import axios from 'axios';

// Client API centralisé : ajoute automatiquement le token d'accès
// et gère le rafraîchissement via le refresh token (cookie httpOnly).
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true, // nécessaire pour le cookie refreshToken httpOnly
});

const TOKEN_KEY = 'bcx_access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Injecte le token d'accès dans chaque requête
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse : tente un refresh automatique en cas de 401
let estEnTrainDeRafraichir = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requeteOriginale = error.config;

    if (error.response?.status === 401 && !requeteOriginale._retry && !estEnTrainDeRafraichir) {
      requeteOriginale._retry = true;
      estEnTrainDeRafraichir = true;

      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        requeteOriginale.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(requeteOriginale);
      } catch (refreshError) {
        clearAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        estEnTrainDeRafraichir = false;
      }
    }

    return Promise.reject(error);
  },
);
