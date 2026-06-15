'use client';

import { useEffect, useState } from 'react';
import { Loader2, Bell, BellRing, Sparkles, X } from 'lucide-react';
import { api } from '@/lib/api';
import { NotificationItem } from '@/lib/types';
import { formaterDate } from '@/lib/format';
import NavBar from '@/components/NavBar';
import OfflineBanner from '@/components/OfflineBanner';

const LIBELLES_TYPE: Record<string, string> = {
  tresorerie_faible: 'Trésorerie faible',
  depense_anormale: 'Dépense anormale',
  score_hausse: 'Score en hausse',
  rappel_saisie: 'Rappel de saisie',
  ia_conseil: 'Conseil IA',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api
      .get<NotificationItem[]>('/notifications')
      .then((res) => setNotifications(res.data))
      .finally(() => setChargement(false));
  }, []);

  async function marquerCommeLue(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    await api.patch(`/notifications/${id}/read`).catch(() => {});
  }

  // Supprime définitivement une notification. `e.stopPropagation()` évite
  // de déclencher le clic du <li> (marquer comme lue) en même temps.
  async function supprimer(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await api.delete(`/notifications/${id}`).catch(() => {});
  }

  return (
    <div className="md:pl-60 pb-20 md:pb-8">
      <OfflineBanner />
      <NavBar />

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        <h1 className="text-2xl font-bold">Notifications</h1>

        {chargement ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primaire" size={28} />
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Aucune notification pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => !n.lu && marquerCommeLue(n.id)}
                className={`relative bg-carte rounded-carte shadow-sm p-4 pr-10 flex items-start gap-3 cursor-pointer transition-all ${
                  !n.lu ? 'border-l-4 border-accent' : 'opacity-60'
                }`}
              >
                {n.lu ? (
                  <Bell size={20} className="text-gray-400 mt-0.5 shrink-0" />
                ) : n.type === 'ia_conseil' ? (
                  <Sparkles size={20} className="text-primaire mt-0.5 shrink-0" />
                ) : (
                  <BellRing size={20} className="text-accent mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold text-primaire mb-1">
                    {LIBELLES_TYPE[n.type] || n.type}
                  </p>
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formaterDate(n.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => supprimer(e, n.id)}
                  aria-label="Supprimer cette notification"
                  title="Supprimer cette notification"
                  className="absolute top-3 right-3 text-gray-400 hover:text-depense transition-colors p-1"
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
