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

const button = document.getElementById('notifications');

function randomNotification() {
  const notifBody = `Created by script.js`;
  const notifImg = 'icons/apple-icon-180.png';
  const options = {
    body: notifBody,
    icon: notifImg,
  };

  new Notification(notifBody, options);
  setTimeout(randomNotification, 1000);
}

button.addEventListener('click', () => {
  // console.log('hello');
  // Notification.requestPermission().then((result) => {
  //   if (result === 'granted') {
  //     randomNotification();
  //   }
  // });
  console.log('inside');

  new Notification('Without permission');

  if (!('Notification' in window)) {
    // Check if the browser supports notifications
    alert('This browser does not support desktop notification');
  } else if (Notification.permission === 'granted') {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    const notification = new Notification('Hi there!1');
    new Notification('Hi there!2');

    console.log('granted');
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
