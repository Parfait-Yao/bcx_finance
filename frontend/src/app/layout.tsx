import type { Metadata } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'BCX Finance',
  description: 'Gérez vos recettes, dépenses et votre Score BCX',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-fond min-h-screen">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
