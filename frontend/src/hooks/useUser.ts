'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Profil {
  id: string;
  nom: string;
  entreprise: string;
  email: string;
}

const CLE_CACHE = 'bcx_profil';

// Retourne les initiales d'un nom (ex: "Aïcha Koné" → "AK")
export function initiales(nom: string): string {
  return nom
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Charge le profil depuis le cache localStorage (instantané) puis
// le rafraîchit depuis l'API en arrière-plan (toujours à jour).
export function useUser() {
  const [profil, setProfil] = useState<Profil | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cache = localStorage.getItem(CLE_CACHE);
      return cache ? JSON.parse(cache) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    api
      .get<Profil>('/users/me')
      .then(({ data }) => {
        setProfil(data);
        localStorage.setItem(CLE_CACHE, JSON.stringify(data));
      })
      .catch(() => {});
  }, []);

  return profil;
}
