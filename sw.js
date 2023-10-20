'use strict';
// Some key things to understand are:

// Service workers are only available over HTTPS or localhost.
// If a service worker's contents contain syntax errors, registration fails and the service worker is discarded.
// Reminder: service workers operate within a scope. Here, the scope is the entire origin, as it was loaded from the root directory.
// When registration begins, the service worker state is set to 'installing'.
// Once registration finishes, installation begins.

// importScripts(
//   'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
// );

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
  '/offline',
  '/offline.html',
];

// https://web.dev/articles/offline-fallback-page
const OFFLINE_VERSION = 1;
const OFFLINE_URL = 'offline.html';

self.addEventListener('install', (event) => {
  // installs only once
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));

      // caching shell assets
      cache.addAll(PRECACHE_ASSETS);
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

// network first
self.addEventListener('fetch', (event) => {
  // show offline page if there's no connection
  // https://web.dev/articles/offline-fallback-page
  console.log('event.request', event.request);
  if (event.request.mode === 'navigate') {
    console.log('---navigate---');
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's
          // supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is
          // likely due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);

          console.log(cachedResponse, OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } else {
    // // don't handle non-GET requests
    // if (event.request.method !== 'GET') {
    //   return;
    // }

    // // ignore /api/auth route
    // if (url.pathname.startsWith('/api/auth')) {
    //   return;
    // }

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

        const cachedOfflinePage = await caches.match('/offline.html');

        console.log(
          'fetched',
          fetchedResponse,
          'cachedOfflinePage',
          cachedOfflinePage
        );
        return fetchedResponse || cachedOfflinePage;
      })()
    );
  }
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
