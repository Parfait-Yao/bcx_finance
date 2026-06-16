'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, FileBarChart, Bell, PlusCircle } from 'lucide-react';

const LIENS = [
  { href: '/dashboard', label: 'Accueil', icone: LayoutDashboard },
  { href: '/transactions', label: 'Historique', icone: Receipt },
  { href: '/transactions/new', label: 'Ajouter', icone: PlusCircle },
  { href: '/reports', label: 'Rapports', icone: FileBarChart },
  { href: '/notifications', label: 'Alertes', icone: Bell },
];

// Navigation principale : barre basse sur mobile, sidebar sur desktop
export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 md:left-0 bg-carte border-r border-gray-100 p-6 gap-2 z-40">
        <div className="text-2xl font-bold text-primaire mb-6">BCX Finance</div>
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
      </aside>

      {/* Barre de navigation mobile — fixée en bas de l'écran.
          On utilise :
          - `fixed` au lieu de `sticky` pour qu'elle reste en place
            même quand la barre d'adresse du navigateur se rétracte
          - `pb-safe` (padding-bottom: env(safe-area-inset-bottom)) pour
            respecter l'encoche/home indicator sur iPhone X et suivants
          - `translate-z-0` force un nouveau contexte de rendu GPU,
            évitant les sauts sur certains Android */}
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
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-bouton transition-all min-w-[56px] ${
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

      {/* Espace réservé en bas pour que le contenu ne passe pas
          sous la barre de navigation sur mobile */}
      <div
        className="md:hidden h-16"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-hidden="true"
      />
    </>
  );
}
