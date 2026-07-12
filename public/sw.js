const CACHE_NAME = "vc-cake-cache-v2";
const ASSETS = [
  "/",
  "/manifest.json",
  "/logo.svg"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept fetch requests for caching
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests or administrative/auth APIs
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  // Bypass Next.js hot module replacement (HMR) and development compilation chunks
  if (
    event.request.url.includes("/_next/") && 
    (event.request.url.includes("webpack-hmr") || event.request.url.includes("hot-update"))
  ) {
    return;
  }

  const url = new URL(event.request.url);

  // Cache-first for images, fonts, and static config assets
  const isStaticAsset = 
    url.pathname.startsWith("/icons/") || 
    url.pathname.startsWith("/images/") ||
    url.pathname.endsWith(".png") || 
    url.pathname.endsWith(".jpg") || 
    url.pathname.endsWith(".jpeg") || 
    url.pathname.endsWith(".svg") || 
    url.pathname.endsWith(".gif") || 
    url.pathname.endsWith(".woff") || 
    url.pathname.endsWith(".woff2") || 
    url.pathname === "/manifest.json";

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
  } else {
    // Network-First strategy for pages, JS scripts, and stylesheets
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
