// Basic Service Worker for OpusMode PWA
const CACHE_NAME = 'opusmode-v1';
const VERSION = '1.3.4 (Build 79)'; // Updated automatically

self.addEventListener('install', (event) => {
    // 1. Force immediate activation for this app
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // claims control of all open clients immediately
    event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// A fetch handler is required for the PWA 'Install' prompt
self.addEventListener('fetch', (event) => {
    // Pass-through: Fetch from network
    event.respondWith(fetch(event.request));
});
