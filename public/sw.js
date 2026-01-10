// Basic Service Worker for OpusMode PWA
const CACHE_NAME = 'opusmode-v1';
const VERSION = '1.2.11 (Build 24)'; // Updated automatically

self.addEventListener('install', (event) => {
    // skipWaiting() forces the waiting ServiceWorker to become the active ServiceWorker.
    // However, it's often safer to wait for a user signal (SKIP_WAITING message)
    // so we don't break the app while they are using it.
    // BUT for this app, we want aggressively fresh updates.
    // We'll keep manual skipWaiting via message as the primary update mechanism for "Refresh".
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
