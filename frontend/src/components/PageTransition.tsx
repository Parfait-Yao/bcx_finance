'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Enveloppe le contenu de chaque page avec une transition douce
 * à chaque changement de route (fade-in + légère montée).
 * Fonctionne avec l'App Router de Next.js sans dépendance externe.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [afficher, setAfficher] = useState(false);

  useEffect(() => {
    // Réinitialise l'animation à chaque changement de page
    setAfficher(false);
    const t = requestAnimationFrame(() => setAfficher(true));
    return () => cancelAnimationFrame(t);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: afficher ? 1 : 0,
        transform: afficher ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  );
}
