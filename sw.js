// Domus-IA España - Service Worker for PWA capabilities
// Version 1.0.0

const CACHE_NAME = 'domus-ia-espana-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/sofia-ai.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap',
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Domus-IA España: Cache opened');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('Domus-IA España: Cache failed', error);
            })
    );
});

// Fetch event - serve cached content
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Domus-IA España: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});