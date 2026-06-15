'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';

/**
 * Récupère des données depuis l'API et les garde à jour "en temps réel"
 * sans action de l'utilisateur, via deux mécanismes simples :
 *  - rafraîchissement périodique (toutes les `intervalleMs`),
 *  - rafraîchissement immédiat quand l'onglet redevient visible/actif
 *    (ex: retour sur le dashboard après avoir ajouté une transaction
 *    dans un autre onglet, ou simplement en revenant sur la page).
 *
 * Reste volontairement simple (pas de WebSocket) : un polling léger suffit
 * pour des données qui changent peu fréquemment (solde, score, etc.).
 */
export function usePolling<T>(url: string, intervalleMs = 15000) {
  const [data, setData] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const enCours = useRef(false);

  const recharger = useCallback(async () => {
    // Évite les requêtes qui se chevauchent (ex: focus + minuteur en même temps)
    if (enCours.current) return;
    enCours.current = true;
    try {
      const { data: reponse } = await api.get<T>(url);
      setData(reponse);
    } finally {
      enCours.current = false;
      setChargement(false);
    }
  }, [url]);

  useEffect(() => {
    recharger();

    const minuteur = setInterval(recharger, intervalleMs);

    function onVisibilite() {
      if (document.visibilityState === 'visible') recharger();
    }
    document.addEventListener('visibilitychange', onVisibilite);
    window.addEventListener('focus', recharger);

    return () => {
      clearInterval(minuteur);
      document.removeEventListener('visibilitychange', onVisibilite);
      window.removeEventListener('focus', recharger);
    };
  }, [recharger, intervalleMs]);

  return { data, chargement, recharger };
}
