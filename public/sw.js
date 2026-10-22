// KapyBa service worker: keeps the app shell and public scan data available after the first visit.
// Owner and other private API answers are never cached. Bump VERSION to drop old caches.
const VERSION = "kb-v1";
const PUBLIC_API = [/^\/api\/s\//, /^\/api\/board/];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

const cacheable = (url, req) =>
  url.origin === location.origin &&
  (req.mode === "navigate" || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || PUBLIC_API.some((r) => r.test(url.pathname)));

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!cacheable(url, req)) return;
  // Pages and public data: the network when there is signal, else the last copy. Static files: the copy first.
  const staticFile = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
  e.respondWith(
    (async () => {
      const cache = await caches.open(VERSION);
      if (staticFile) {
        const hit = await cache.match(req);
        if (hit) return hit;
      }
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      } catch {
        const hit = await cache.match(req);
        if (hit) return hit;
        if (req.mode === "navigate") {
          const home = await cache.match("/");
          if (home) return home;
        }
        return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })(),
  );
});
