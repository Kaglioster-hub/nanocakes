const CACHE_VERSION = Date.now().toString();
const RUNTIME_CACHE = `nanocakes-${CACHE_VERSION}`;

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== RUNTIME_CACHE ? caches.delete(k) : Promise.resolve()));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith((async () => {
      try { return await fetch(req, { cache: "no-store" }); }
      catch { const cache = await caches.open(RUNTIME_CACHE); return await cache.match(req) || Response.error(); }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(req);
    const fetchAndPut = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; })
                                  .catch(() => cached || Response.error());
    return cached ? fetchAndPut.then(r => r) : fetchAndPut;
  })());
});
