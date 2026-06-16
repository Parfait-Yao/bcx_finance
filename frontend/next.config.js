const withPWA = require('next-pwa')({
  dest: 'public',
  // Désactivé en développement pour éviter les conflits avec le hot-reload
  disable: process.env.NODE_ENV === 'development',
  // Stratégie de cache : met en cache toutes les pages et assets
  register: true,
  skipWaiting: true,
  // Exclut le sw.js manuel qu'on avait avant (next-pwa en génère un meilleur)
  buildExcludes: [/middleware-manifest\.json$/],
  // Pages mises en cache au pré-chargement (disponibles hors-ligne immédiatement)
  runtimeCaching: [
    {
      // Cache des pages de l'app (dashboard, transactions, etc.)
      urlPattern: /^https:\/\/bcx-finance\.vercel\.app\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'bcx-pages',
        expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // Cache des assets statiques Next.js (JS, CSS, fonts)
      urlPattern: /^\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'bcx-static',
        expiration: { maxEntries: 128, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      // Cache des images (Unsplash, etc.)
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'bcx-images',
        expiration: { maxEntries: 32, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      // API backend : network-first, fallback sur cache si hors-ligne
      urlPattern: /^https:\/\/bcx-finance\.onrender\.com\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'bcx-api',
        expiration: { maxEntries: 32, maxAgeSeconds: 5 * 60 },
        networkTimeoutSeconds: 8,
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = withPWA(nextConfig);
