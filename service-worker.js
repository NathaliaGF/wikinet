/* ── RedesWiki Service Worker — Offline First ────────── */
'use strict';

const CACHE_NAME = 'redeswiki-v11';

const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/components.css',
  './js/app.js',
  './js/navigation.js',
  './js/progress.js',
  './js/interactive.js',
  './js/glossary.js',
  './js/subnet-calc.js',
  './data/content.js',
  './data/glossary-terms.js',
  './data/certification-quiz.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/og-cover.png'
];

/* ── Install: pre-cache all assets ──────────────────── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: delete old caches ────────────────────── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isHtmlRequest(request) {
  return request.mode === 'navigate' ||
    (request.destination === 'document') ||
    (request.headers.get('accept') || '').includes('text/html');
}

function isStaticAsset(requestUrl) {
  return /\.(?:css|js|png|jpg|jpeg|svg|webp|ico|json)$/i.test(requestUrl.pathname);
}

function isImageAsset(requestUrl) {
  return /\.(?:png|jpg|jpeg|svg|webp|ico)$/i.test(requestUrl.pathname);
}

/* ── Fetch: HTML network-first, assets cache-first ───── */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  if (url.href.includes('fonts.googleapis.com') || url.href.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(response => {
            if (response && response.status === 200) {
              cache.put(e.request, response.clone());
            }
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  if (isHtmlRequest(e.request)) {
    e.respondWith(
      fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() =>
        caches.match(e.request).then(cached => cached || caches.match('./index.html'))
      )
    );
    return;
  }

  if (isImageAsset(url)) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          const networkFetch = fetch(e.request).then(response => {
            if (response && response.status === 200 && response.type !== 'opaque') {
              cache.put(e.request, response.clone());
            }
            return response;
          }).catch(() => cached);
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  if (isStaticAsset(url)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        });
      })
    );
    return;
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
