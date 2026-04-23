// Suno Prompt Builder – Service Worker
// Beim Update: CACHE_NAME-Version hochzählen, damit alte Caches gelöscht werden
const CACHE_NAME = 'suno-pb-v2-2-0';
const CORE_FILES = [
  './',
  './index.html',
  './version.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Mono:wght@300;400;500&display=swap'
];

// Install: Core-Dateien cachen
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES))
  );
  self.skipWaiting();
});

// Activate: Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network-first für version.json (Update-Check), Cache-first für Rest
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase-Requests immer direkt (kein Cache)
  if (url.hostname.includes('supabase.co')) return;

  // version.json: immer frisch vom Netz holen
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Alles andere: Cache-first, Fallback Network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
