// // Don't register the service worker
// // until the page has fully loaded
// window.addEventListener('load', () => {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then((registration) => {
//         console.log('Service worker registered!', registration);
//       })
//       .catch((error) => {
//         console.warn('Error registering service worker:');
//         console.warn(error);
//       });
//   }
// });

window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
});
