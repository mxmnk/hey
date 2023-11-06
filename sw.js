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

// Service Worker have a scope of url where they can work, and this scope can't go up except with Service-Worker-Allowed Header
// (and not Allow-Service-Work wich refer to nothing), in this header you can specify your desired scope \ here.
// https://pushpad.xyz/blog/how-to-change-the-scope-of-a-service-worker

// if we need offline first approach
// https://gomakethings.com/how-to-set-an-expiration-date-for-items-in-a-service-worker-cache/

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

  '/pages/contacts',
];

// https://web.dev/articles/offline-fallback-page
const OFFLINE_VERSION = 1;
const OFFLINE_URL = '/offline';

// installs only once
self.addEventListener('install', (event) => {
  this.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // caching shell assets
      cache.addAll(PRECACHE_ASSETS);
    })()
  );
});

// Navigation preload is a feature that lets you say,
// "Hey, when the user makes a GET navigation request, start the network request while the service worker is booting up".
// The startup delay is still there, but it doesn't block the network request, so the user gets content sooner.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  // Tell the active service worker to take control of the page immediately
  self.clients.claim();
});

// network first
self.addEventListener('fetch', (event) => {
  console.log('event.request', event.request);

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          // try to use the navigation preload response if it's supported
          // https://web.dev/articles/navigation-preload
          // const preloadResponse = await event.preloadResponse;

          // if (preloadResponse) {
          //   cache.put(event.request, preloadResponse.clone());
          //   return preloadResponse;
          // }

          // always try the network first
          const networkResponse = await fetch(event.request);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is
          // likely due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);

          // // if we need to fall back instead of cache
          // const cachedResponse = await cache.match(OFFLINE_URL);

          // if we need to fall back only when we don't have required page in cache
          let cachedResponse = await cache.match(event.request);

          if (!cachedResponse) {
            cachedResponse = await cache.match(OFFLINE_URL);
          }

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

    // // only images
    // if (event.request.destination === 'image') {
    //   event.respondWith(/* your caching logic here */);
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

        return fetchedResponse || cachedResponse;
      })()
    );
  }
});

// google docs
// doesn't live offline without shell
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
