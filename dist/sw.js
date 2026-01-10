// Basic Service Worker for OpusMode PWA
const CACHE_NAME = 'opusmode-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// A fetch handler is required for the PWA 'Install' prompt
self.addEventListener('fetch', (event) => {
    // Pass-through: Fetch from network
    event.respondWith(fetch(event.request));
});
