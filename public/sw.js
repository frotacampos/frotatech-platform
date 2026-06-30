const CACHE_NAME = "lumicity-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (!event.request || !event.request.url) return;

  // Apenas para navegação (páginas), usa network-first com fallback para cache
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html").then((r) => r || fetch("/index.html"))
      )
    );
    return;
  }

  // Ignora requisições não-GET (POST, etc.)
  if (event.request.method !== "GET") return;

  // Para outros recursos estáticos, usa cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => {}))
  );
});
