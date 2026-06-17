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
        // On utilise UNIQUEMENT opacity — pas de transform.
        // Sur Safari iOS, tout élément `position: fixed` à l'intérieur
        // d'un conteneur avec `transform` perd son comportement fixed
        // et devient relatif au conteneur. La navbar "saute" donc à
        // chaque transition. Avec opacity seul, ce bug n'existe pas.
        opacity: afficher ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      {children}
    </div>
  );
}
