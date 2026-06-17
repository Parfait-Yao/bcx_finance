'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/**
 * Hook de données avec cache hors-ligne.
 *
 * Comportement :
 * 1. Au montage → lit le cache localStorage immédiatement (affichage instantané)
 * 2. Tente un appel API → si succès : met à jour l'affichage ET le cache
 * 3. Si hors-ligne / erreur réseau → garde le cache affiché, affiche un
 *    bandeau "données hors-ligne" discret
 * 4. Quand la connexion revient (event "online") → rafraîchit automatiquement
 *
 * Ainsi l'utilisateur voit toujours les dernières données connues, même
 * sans connexion, sur toutes les pages de l'app.
 */
export function useOfflineCache<T>(url: string, cacheKey: string) {
  const [data, setData] = useState<T | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cache = localStorage.getItem(`bcx_cache_${cacheKey}`);
      return cache ? JSON.parse(cache) : null;
    } catch {
      return null;
    }
  });
  const [chargement, setChargement] = useState(true);
  const [horsLigne, setHorsLigne] = useState(false);
  const enCours = useRef(false);

  const charger = useCallback(async () => {
    if (enCours.current) return;
    enCours.current = true;
    try {
      const { data: reponse } = await api.get<T>(url);
      setData(reponse);
      setHorsLigne(false);
      // Sauvegarde en cache pour la prochaine utilisation hors-ligne
      try {
        localStorage.setItem(`bcx_cache_${cacheKey}`, JSON.stringify(reponse));
      } catch { /* quota dépassé — on ignore */ }
    } catch {
      // Pas de réseau → on garde le cache existant affiché
      setHorsLigne(true);
    } finally {
      setChargement(false);
      enCours.current = false;
    }
  }, [url, cacheKey]);

  useEffect(() => {
    charger();

    // Rafraîchit au retour de connexion
    window.addEventListener('online', charger);
    // Rafraîchit au retour sur l'onglet
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') charger();
    });

    return () => {
      window.removeEventListener('online', charger);
    };
  }, [charger]);

  return { data, chargement, horsLigne, recharger: charger };
}
