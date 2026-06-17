import NavBar from '@/components/NavBar';
import OfflineBanner from '@/components/OfflineBanner';
import MobileHeader from '@/components/MobileHeader';
import PageTransition from '@/components/PageTransition';

// Layout partagé par toutes les pages connectées.
// NavBar et MobileHeader sont montés UNE SEULE FOIS et ne sont jamais
// détruits lors des navigations — garantit que la barre du bas reste
// fixe et que le header ne clignote pas entre les pages.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-fond">
      {/* Bannière hors-ligne */}
      <OfflineBanner />

      {/* Sidebar desktop + barre mobile (fixes, hors du PageTransition) */}
      <NavBar />

      {/* Header mobile : titre de page + avatar utilisateur */}
      <MobileHeader />

      {/* Contenu principal scrollable */}
      <div className="md:pl-60 pb-24 md:pb-8">
        <PageTransition>
          {children}
        </PageTransition>
      </div>
    </div>
  );
}
