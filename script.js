// Don't register the service worker
// until the page has fully loaded
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        return registration.pushManager
          .getSubscription()
          .then(async (subscription) => {
            // registration part
          });
      })
      .then((registration) => {
        console.log('Service worker registered!', registration);
      })
      .catch((error) => {
        console.warn('Error registering service worker:');
        console.warn(error);
      });
  }
});

const button = document.getElementById('notifications');

button.addEventListener('click', () => {
  // requires notifications to be enabled on device
  if (!('Notification' in window)) {
    // Check if the browser supports notifications
    alert('This browser does not support desktop notification');
  } else if (Notification.permission === 'granted') {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    const notification = new Notification('Hi there!');
    // …
  } else if (Notification.permission !== 'denied') {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === 'granted') {
        const notification = new Notification('Hi there!');
        // …
      }
    });
  }

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them anymore.
});

navigator.serviceWorker
  .register('service-worker.js')
  .then((registration) => {
    return registration.pushManager
      .getSubscription()
      .then(async (subscription) => {
        // registration part
      });
  })
  .then((subscription) => {
    // subscription part
  });
