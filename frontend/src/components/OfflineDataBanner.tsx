'use client';

import { WifiOff } from 'lucide-react';

/**
 * Bandeau discret affiché en haut du contenu quand les données affichées
 * proviennent du cache local (pas de connexion internet disponible).
 * Disparaît dès que la connexion revient et que les données sont rafraîchies.
 */
export default function OfflineDataBanner() {
  return (
    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-bouton px-3 py-2">
      <WifiOff size={14} className="shrink-0" />
      <span>Mode hors-ligne — données de votre dernière visite affichées</span>
    </div>
  );
}
