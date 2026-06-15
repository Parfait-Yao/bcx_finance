'use client';

import { useRouter } from 'next/navigation';
import { api, setAccessToken, clearAccessToken, getAccessToken } from '@/lib/api';

interface LoginPayload {
  telephone: string;
  motDePasse: string;
}

interface RegisterPayload {
  nom: string;
  telephone: string;
  email: string;
  entreprise: string;
  motDePasse: string;
  ville: string;
  pays: string;
}

// Hook d'authentification : connexion, inscription, déconnexion
export function useAuth() {
  const router = useRouter();

  async function login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    setAccessToken(data.accessToken);
    router.push('/dashboard');
  }

  async function register(payload: RegisterPayload) {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.accessToken);
    router.push('/dashboard');
  }

  function logout() {
    clearAccessToken();
    router.push('/login');
  }

  function estConnecte() {
    return !!getAccessToken();
  }

  return { login, register, logout, estConnecte };
}
