/* SwiingLab — mise à jour réseau : neutralise les anciens caches hors ligne.
   Les données personnelles en localStorage ne sont jamais modifiées. */
self.addEventListener('install', event => {
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(new Request(event.request, { cache: 'no-store' })));
  }
});
