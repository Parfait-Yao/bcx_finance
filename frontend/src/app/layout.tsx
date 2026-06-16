import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import PageTransition from '@/components/PageTransition';
import NavigationProgress from '@/components/NavigationProgress';

export const metadata: Metadata = {
  title: 'BCX Finance',
  description: 'Gérez vos recettes, dépenses et votre Score BCX en temps réel',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BCX Finance',
  },
};

// Couleur de la barre de statut sur mobile
export const viewport: Viewport = {
  themeColor: '#1A5C38',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Icônes Apple (iOS) */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-fond min-h-screen">
        <NavigationProgress />
        <ServiceWorkerRegister />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
