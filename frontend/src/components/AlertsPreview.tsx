'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '@/lib/api';
import { NotificationItem } from '@/lib/types';

// Affiche un aperçu des alertes IA non lues sur le dashboard.
// Chaque alerte peut être fermée (croix) pour la supprimer définitivement
// quand l'utilisateur ne souhaite plus la voir.
export default function AlertsPreview() {
  const [alertes, setAlertes] = useState<NotificationItem[]>([]);

  useEffect(() => {
    api
      .get<NotificationItem[]>('/notifications')
      .then((res) => setAlertes(res.data.filter((n) => !n.lu).slice(0, 3)))
      .catch(() => setAlertes([]));
  }, []);

  async function fermer(id: string) {
    // Mise à jour optimiste : l'alerte disparaît immédiatement
    setAlertes((prev) => prev.filter((a) => a.id !== id));
    await api.delete(`/notifications/${id}`).catch(() => {});
  }

  if (alertes.length === 0) return null;

  return (
    <div className="bg-carte rounded-carte shadow-sm p-4">
      <h2 className="font-semibold mb-3 flex items-center gap-2">
        <AlertTriangle size={18} className="text-accent" />
        Alertes
      </h2>
      <ul className="space-y-2">
        {alertes.map((a) => (
          <li key={a.id} className="relative text-sm bg-accent/10 text-[#7a5400] rounded-bouton px-3 py-2 pr-8">
            {a.message}
            <button
              onClick={() => fermer(a.id)}
              aria-label="Supprimer cette alerte"
              title="Supprimer cette alerte"
              className="absolute top-1.5 right-1.5 text-[#7a5400]/60 hover:text-[#7a5400] transition-colors p-1"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
