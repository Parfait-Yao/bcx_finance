'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileBarChart, Bell, PlusCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUser, initiales } from '@/hooks/useUser';

const LIENS = [
  { href: '/dashboard', label: 'Accueil', icone: LayoutDashboard },
  { href: '/transactions', label: 'Historique', icone: Receipt },
  { href: '/transactions/new', label: 'Ajouter', icone: PlusCircle },
  { href: '/reports', label: 'Rapports', icone: FileBarChart },
  { href: '/notifications', label: 'Alertes', icone: Bell },
];

// Navigation principale : sidebar sur desktop, barre basse sur mobile.
// Le nom et les initiales de l'utilisateur s'affichent :
//  - dans la sidebar desktop (nom + entreprise + bouton déconnexion)
//  - dans la navbar mobile (avatar avec initiales en haut à droite de la barre)
export default function NavBar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const profil = useUser();

  return (
    <>
      {/* ── Sidebar desktop ── */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 md:left-0 bg-carte border-r border-gray-100 z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-xl font-extrabold text-primaire tracking-tight">BCX Finance</span>
        </div>

        {/* Profil utilisateur desktop */}
        {profil && (
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-full bg-primaire text-white flex items-center justify-center font-bold text-sm shrink-0">
              {initiales(profil.nom)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{profil.nom}</p>
              {profil.entreprise && (
                <p className="text-xs text-gray-400 truncate">{profil.entreprise}</p>
              )}
            </div>
          </div>
        )}

        {/* Liens de navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-4 py-4 overflow-y-auto">
          {LIENS.map(({ href, label, icone: Icone }) => {
            const actif = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-bouton transition-all ${
                  actif ? 'bg-primaire text-white shadow-md' : 'text-gray-600 hover:bg-fond'
                }`}
              >
                <Icone size={20} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bouton déconnexion desktop */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-bouton text-gray-500 hover:bg-depense/10 hover:text-depense transition-all"
          >
            <LogOut size={18} />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── Barre de navigation mobile ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-carte border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', transform: 'translateZ(0)' }}
      >
        <div className="flex justify-around items-center py-2">
          {LIENS.map(({ href, label, icone: Icone }) => {
            const actif = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-bouton transition-all min-w-[52px] ${
                  actif ? 'text-primaire' : 'text-gray-400'
                }`}
              >
                <Icone size={22} />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Espace réservé pour que le contenu ne passe pas sous la navbar mobile */}
      <div
        className="md:hidden h-16"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden="true"
      />
    </>
  );
}
