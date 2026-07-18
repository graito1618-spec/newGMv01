// ================================================================
// SERVICE WORKER - GAJAH MAS 2026
// Naikkan angka versi di CACHE_NAME setiap kali update file besar,
// supaya cache lama otomatis dibersihkan.
// ================================================================
const CACHE_NAME = 'gajah-mas-2026-v6';

const APP_SHELL = [
  './',
  './index.html',
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

// Activate: hapus SEMUA cache versi lama (termasuk halaman dashboard yang
// sudah kadung ke-cache dari versi sebelumnya)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// ----------------------------------------------------------------
// Strategi fetch:
//   - Halaman HTML (dashboard-kerja.html, dashboard-laporan.html,
//     dashboard-data.html, index.html, dst): NETWORK-FIRST.
//     Selalu coba ambil versi TERBARU dari internet dulu. Kalau
//     berhasil, simpan ke cache & tampilkan. Kalau gagal (offline),
//     baru pakai cache lama sebagai cadangan.
//     Ini PENTING karena aplikasi ini masih sering diperbarui —
//     dengan cache-first (strategi lama), perbaikan yang sudah
//     diupload ke GitHub TIDAK akan pernah terlihat oleh pengguna
//     sampai cache-nya kadaluarsa/dibersihkan manual.
//   - File statis lain (ikon, manifest, library CDN): CACHE-FIRST
//     seperti biasa, supaya tetap ringan & bisa dipakai offline.
// ----------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isHtmlPage = event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isHtmlPage) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
    })
  );
});
