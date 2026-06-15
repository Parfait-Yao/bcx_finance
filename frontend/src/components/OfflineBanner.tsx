'use client';

import { useEffect, useState } from 'react';
import { synchroniserTransactionsEnAttente, compterTransactionsEnAttente } from '@/lib/offline';

/**
 * Bannière dorée affichée hors-ligne, et barre de progression
 * pendant la synchronisation des transactions en attente au retour de connexion.
 */
export default function OfflineBanner() {
  const [horsLigne, setHorsLigne] = useState(false);
  const [enSynchronisation, setEnSynchronisation] = useState(false);
  const [enAttente, setEnAttente] = useState(0);

  useEffect(() => {
    setHorsLigne(!navigator.onLine);
    setEnAttente(compterTransactionsEnAttente());

    const gererHorsLigne = () => setHorsLigne(true);

    // Au retour de connexion : synchronise automatiquement la file d'attente
    const gererEnLigne = async () => {
      setHorsLigne(false);
      const nombreEnAttente = compterTransactionsEnAttente();
      if (nombreEnAttente === 0) return;

      setEnSynchronisation(true);
      try {
        await synchroniserTransactionsEnAttente();
        setEnAttente(0);
      } catch {
        // La synchronisation échouée laisse les transactions en localStorage
        // pour une nouvelle tentative ultérieure.
      } finally {
        setEnSynchronisation(false);
      }
    };

    window.addEventListener('offline', gererHorsLigne);
    window.addEventListener('online', gererEnLigne);

    return () => {
      window.removeEventListener('offline', gererHorsLigne);
      window.removeEventListener('online', gererEnLigne);
    };
  }, []);

  if (!horsLigne && !enSynchronisation && enAttente === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {horsLigne && (
        <div className="bg-accent text-[#1A1A1A] text-center text-sm font-medium py-2 px-4 shadow-md">
          ⚠️ Vous êtes hors connexion. Vos transactions sont enregistrées localement
          {enAttente > 0 && ` (${enAttente} en attente)`}.
        </div>
      )}

      {enSynchronisation && (
        <div className="bg-primaire text-white text-center text-sm font-medium py-2 px-4">
          <div className="mb-1">Synchronisation de vos transactions en cours...</div>
          <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {!horsLigne && !enSynchronisation && enAttente > 0 && (
        <div className="bg-accent text-[#1A1A1A] text-center text-sm font-medium py-2 px-4 shadow-md">
          {enAttente} transaction(s) en attente de synchronisation.
        </div>
      )}
    </div>
  );
}
