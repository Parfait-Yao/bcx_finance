'use client';

import NavBar from '@/components/NavBar';
import OfflineBanner from '@/components/OfflineBanner';

/**
 * Layout partagé par toutes les pages authentifiées.
 * La NavBar et OfflineBanner sont ici — complètement HORS du flux
 * scrollable des pages, ce qui garantit que la navbar reste fixée
 * en bas sur tous les appareils mobiles (iOS Safari inclus).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fond">
      {/* Bannière hors-ligne — hors du scroll */}
      <OfflineBanner />

      {/* Sidebar desktop + barre mobile — hors du scroll */}
      <NavBar />

      {/* Contenu principal scrollable
          - md:pl-60 : décale à droite de la sidebar sur desktop
          - pb-20    : espace en bas pour la navbar mobile
          - md:pb-8  : espace réduit sur desktop (pas de navbar mobile) */}
      <div className="md:pl-60 pb-20 md:pb-8">
        {children}
      </div>
    </div>
  );
}
