const CACHE = '180-gaming-v5';

const ASSETS = [
'./',
'./index.html',
'./manifest.webmanifest',
'./icon.svg'
];

self.addEventListener('install', event => {
self.skipWaiting();

event.waitUntil(
caches.open(CACHE).then(cache => {
return cache.addAll(ASSETS);
})
);
});

self.addEventListener('activate', event => {
event.waitUntil(
Promise.all([
caches.keys().then(keys => {
return Promise.all(
keys
.filter(key => key !== CACHE)
.map(key => caches.delete(key))
);
}),
self.clients.claim()
])
);
});

self.addEventListener('fetch', event => {
if (event.request.mode === 'navigate') {
event.respondWith(
fetch(event.request)
.then(response => {
const copy = response.clone();

caches.open(CACHE).then(cache => {
cache.put('./index.html', copy);
});

return response;
})
.catch(() => {
return caches.match('./index.html');
})
);

return;
}

event.respondWith(
caches.match(event.request).then(cached => {
return cached || fetch(event.request);
})
);
});
