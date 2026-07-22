// ================================================================
// SERVICE WORKER - GAMAS 2026
// Naikkan angka versi di CACHE_NAME setiap kali update file,
// supaya browser mengambil versi baru (bukan cache lama).
// ================================================================
const CACHE_NAME = 'gamas-2026-v6';

const APP_SHELL = [
  './',
  './index.html',
  './dashboard-kerja.html',
  './dashboard-laporan.html',
  './dashboard-data.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: simpan file utama ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: coba cache dulu, kalau tidak ada baru ambil dari internet
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // simpan salinan baru ke cache untuk penggunaan offline berikutnya
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
