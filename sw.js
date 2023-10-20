'use strict';
// Some key things to understand are:

// Service workers are only available over HTTPS or localhost.
// If a service worker's contents contain syntax errors, registration fails and the service worker is discarded.
// Reminder: service workers operate within a scope. Here, the scope is the entire origin, as it was loaded from the root directory.
// When registration begins, the service worker state is set to 'installing'.
// Once registration finishes, installation begins.

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

const CACHE_NAME = 'static';
// You can use a pre-fecth strategy in order to ensure all the static assets are downloaded
// and available in the cache when the service worker is installed:
// However keep in mind that this kind of strategy is typically used for the app shell files (much less than 300MB).
// If the service worker cannot download the resources you defined for the "install" phase, it will abort its installation.

// https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers
// appShellFiles
const PRECACHE_ASSETS = [
  '/',
  '/icons/apple-icon-180.png',
  '/manifest.json',
  '/secondPage',
  // '/css/global.bc7b80b7.css',
  // '/css/home.fe5d0b23.css',
  // '/js/home.d3cc4ba4.js',
  // '/js/jquery.43ca4933.js'
];

self.addEventListener('install', (event) => {
  // installs only once
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(PRECACHE_ASSETS);
    })()
  );
});

// network first
self.addEventListener('fetch', (event) => {
  // handle only get?
  // show offline page if there's no connection
  // https://web.dev/articles/offline-fallback-page
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);

      let fetchedResponse;

      try {
        fetchedResponse = await fetch(event.request);
        cache.put(event.request, fetchedResponse.clone());
      } catch (error) {
        console.error(error);
      }

      return fetchedResponse || cachedResponse;
    })()
  );
});

// google docs
// doesn't live offline
// if (event.request.destination === 'image') {
//   event.respondWith(
//     (async () => {
//       const cache = await caches.open(CACHE_NAME);
//       console.log('cache', cache, caches);
//       const cachedResponse = await cache.match(event.request);
//       const fetchedResponse = await fetch(event.request);
//       cache.put(event.request, fetchedResponse.clone());
//       return cachedResponse || fetchedResponse;
//     })()
//   );
// }
