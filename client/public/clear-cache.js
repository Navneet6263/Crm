// Clear browser cache and service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service worker unregistered');
    }
  });
}

// Clear localStorage
localStorage.clear();
sessionStorage.clear();

// Clear caches
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

console.log('Cache cleared successfully');