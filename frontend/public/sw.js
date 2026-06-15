// Service Worker BCX Finance — Mode Offline
//
// Stratégie :
// - cache-first pour les assets statiques (JS, CSS, icônes)
// - network-first avec fallback sur le cache pour les pages/données
//   (notamment le dashboard, pour qu'il reste consultable hors-ligne)

const CACHE_NAME = 'bcx-finance-cache-v1';
const ASSETS_A_PRECACHER = ['/dashboard', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_A_PRECACHER)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((cle) => cle !== CACHE_NAME).map((cle) => caches.delete(cle))),
    ),
  );
  self.clients.claim();
});

const EST_ASSET_STATIQUE = (url) =>
  url.pathname.startsWith('/_next/static') ||
  /\.(js|css|png|jpg|jpeg|svg|ico|woff2?)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ne pas intercepter les appels vers l'API backend (gérés par lib/offline.ts)
  if (url.pathname.startsWith('/api')) return;

  if (event.request.method !== 'GET') return;

  if (EST_ASSET_STATIQUE(url)) {
    // Cache-first pour les assets statiques
    event.respondWith(
      caches.match(event.request).then((reponseCache) => {
        if (reponseCache) return reponseCache;
        return fetch(event.request).then((reponseReseau) => {
          const clone = reponseReseau.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return reponseReseau;
        });
      }),
    );
    return;
  }

  // Network-first avec fallback sur le cache pour les pages (ex: dashboard)
  event.respondWith(
    fetch(event.request)
      .then((reponseReseau) => {
        const clone = reponseReseau.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return reponseReseau;
      })
      .catch(() => caches.match(event.request)),
  );
});
