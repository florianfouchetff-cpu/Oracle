// Pythie standalone v0.92 · build 2026-11-15 · shell ee9bcb50f015
// Doctrine du sceau (leçon 2026-11-14) : le shell est cache-first ; sans sceau, un
// index.html corrige mais un sw.js identique au bit près ne serait jamais re-installe
// et le telephone servirait l'ancien shell pour toujours. Le sceau = empreinte du shell :
// toute modification du shell change BUILD, donc sw.js, donc le worker se re-installe
// au prochain passage, rafraichit le cache (skipWaiting + clients.claim) et supprime
// les anciens caches au activate.
const CACHE = 'pythie-v0.92-ee9bcb50f015';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
// Doctrine : le service worker ne touche que le shell same-origin en GET ;
// les acquisitions réseau (relevé web) ne sont jamais interceptées ni cachées.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
