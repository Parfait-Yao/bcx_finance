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

      {/* Barre de navigation mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-carte border-t border-gray-100 flex justify-around items-center py-2 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        {LIENS.map(({ href, label, icone: Icone }) => {
          const actif = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-bouton transition-all ${
                actif ? 'text-primaire' : 'text-gray-400'
              }`}
            >
              <Icone size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
