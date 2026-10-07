const APP_SHELL = [
'./',
'./index.html',
'./manifest.webmanifest',
'./icon.svg'
];

// Install the new service worker
self.addEventListener('install', event => {
self.skipWaiting();

event.waitUntil(
caches.open(CACHE_NAME)
.then(cache => cache.addAll(APP_SHELL))
);
});

// Delete ALL previous 180 Gaming caches
self.addEventListener('activate', event => {
event.waitUntil(
caches.keys()
.then(cacheNames =>
Promise.all(
cacheNames
.filter(name => name !== CACHE_NAME)
.map(name => caches.delete(name))
)
)
.then(() => self.clients.claim())
);
});

// Always try the newest version from the server first.
// Use the cache only if the network is unavailable.
self.addEventListener('fetch', event => {

if (event.request.method !== 'GET') {
return;
}

// HTML/navigation requests
if (event.request.mode === 'navigate') {

event.respondWith(
fetch(event.request)
.then(response => {

const copy = response.clone();

caches.open(CACHE_NAME)
.then(cache => {
cache.put('./index.html', copy);
});

return response;
})
.catch(() =>
caches.match('./index.html')
)
);

return;
}

// Other app files
event.respondWith(
fetch(event.request)
.then(response => {

const copy = response.clone();

caches.open(CACHE_NAME)
.then(cache => {
cache.put(event.request, copy);
});

return response;
})
.catch(() =>
caches.match(event.request)
)
);
});
