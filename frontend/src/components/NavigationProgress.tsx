'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Barre de progression fine en haut de l'écran qui s'anime
 * à chaque changement de page — donne un retour visuel immédiat
 * que la navigation est en cours (style YouTube / GitHub).
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [largeur, setLargeur] = useState(0);

  useEffect(() => {
    // Démarre la barre immédiatement
    setVisible(true);
    setLargeur(30);

    // Progresse rapidement jusqu'à 85%
    const t1 = setTimeout(() => setLargeur(85), 100);
    // Termine et masque
    const t2 = setTimeout(() => setLargeur(100), 400);
    const t3 = setTimeout(() => {
      setVisible(false);
      setLargeur(0);
    }, 650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[100] h-[3px] bg-accent rounded-r-full"
      style={{
        width: `${largeur}%`,
        transition: 'width 0.3s ease',
      }}
    />
  );
}
