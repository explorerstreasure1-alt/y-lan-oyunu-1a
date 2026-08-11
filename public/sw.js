const CACHE = "snake-abc-v5-story";
const ASSETS = ["/", "/index.html", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Sayfa gezinmeleri her zaman önce ağdan yüklensin - güncellemeler anında ulaşsın
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Diğer istekler (statik dosyalar): önce önbellek, yoksa ağ
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).then((r) => {
      return caches.open(CACHE).then((c) => { c.put(e.request, r.clone()); return r; });
    }).catch(() => caches.match("/index.html")))
  );
});
