// Some key things to understand are:

// Service workers are only available over HTTPS or localhost.
// If a service worker's contents contain syntax errors, registration fails and the service worker is discarded.
// Reminder: service workers operate within a scope. Here, the scope is the entire origin, as it was loaded from the root directory.
// When registration begins, the service worker state is set to 'installing'.
// Once registration finishes, installation begins.

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

// '/css/global.bc7b80b7.css',
// '/css/home.fe5d0b23.css',
// '/js/home.d3cc4ba4.js',
// '/js/jquery.43ca4933.js'

// const CACHE_NAME = 'cool-cache';

const CACHE_NAME = 'static';

// const PRECACHE_ASSETS = ['/assets/', '/src/'];
const PRECACHE_ASSETS = ['./'];

self.addEventListener('install', (event) => {
  // installs only once
  console.log('Install');

  // event.waitUntil(caches.open(CACHE_NAME).then());
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(PRECACHE_ASSETS);
    })()
  );
});

// // cache first
// self.addEventListener('fetch', (event) => {
//   event.respondWith(async () => {
//     const cache = await caches.open(CACHE_NAME);

//     // match the request to our cache
//     const cachedResponse = await cache.match(event.request);

//     // check if we got a valid response
//     if (cachedResponse !== undefined) {
//       // cache hit, return the resource
//       return cachedResponse;
//     } else {
//       // otherwise, go to network
//       return fetch(event.request);
//     }
//   });
// });

// stale-while-revalidate
// check the cache first, and the update the cache in the background
self.addEventListener('fetch', (event) => {
  event.respondWith(async () => {
    console.log('=========================');
    const cache = await caches.open(CACHE_NAME);

    // try the cache first
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse !== undefined) {
      // now, we fetch a new response and cache it in the background
      fetch(event.request).then((response) => {
        cache.put(event.response, response.clone());
      });
      // we don't await the above line, so we return out cachedResponse right away
      return cachedResponse;
    } else {
      // otherwise, go to network
      return fetch(event.request);
    }
  });
});

// console.log('workbox', workbox);
// console.log('workbox.routing', workbox.routing.registerRoute);

// workbox.routing.registerRoute(
//   ({ request }) => request.destination === 'image',
//   new workbox.cacheableResponse.CacheableResponsePlugin()
// );

// networkFirst()
