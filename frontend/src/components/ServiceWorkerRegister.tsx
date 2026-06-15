'use client';

import { useEffect } from 'react';

// Enregistre le Service Worker pour le mode offline (cache dashboard + assets)
// Uniquement en production : en développement, le cache "cache-first" des
// assets statiques empêcherait de voir les changements de code à chaud.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Erreur d\'enregistrement du Service Worker :', err);
      });
    }
  }, []);

  return null;
}
