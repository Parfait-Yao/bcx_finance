'use client';

import { usePathname } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useUser, initiales } from '@/hooks/useUser';

const TITRES_PAGE: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/transactions': 'Transactions',
  '/transactions/new': 'Nouvelle transaction',
  '/reports': 'Rapports',
  '/notifications': 'Notifications',
};

// Header mobile affiché en haut des pages connectées (remplace le titre
// statique et affiche le nom + avatar + raccourci notifications).
// Caché sur desktop (la sidebar gère l'affichage du profil).
export default function MobileHeader() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const profil = useUser();
  const titre = TITRES_PAGE[pathname] ?? 'BCX Finance';

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-carte border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between gap-3"
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Titre de la page courante */}
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide leading-none mb-0.5">
          BCX Finance
        </p>
        <h1 className="text-base font-bold text-gray-900 truncate">{titre}</h1>
      </div>

      {/* Droite : notifications + avatar utilisateur */}
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/notifications" className="relative p-2 text-gray-500 hover:text-primaire transition-colors">
          <Bell size={20} />
        </Link>

        {profil ? (
          <button
            onClick={logout}
            title={`${profil.nom} — Appuyez pour vous déconnecter`}
            className="w-9 h-9 rounded-full bg-primaire text-white flex items-center justify-center font-bold text-sm shadow-sm"
          >
            {initiales(profil.nom)}
          </button>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
        )}
      </div>
    </header>
  );
}
