const NOME_CACHE = "diario-didattico-v41";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(NOME_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((nomi) =>
      Promise.all(nomi.filter((n) => n !== NOME_CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const richiesta = evento.request;
  if (richiesta.method !== "GET") return;

  const url = new URL(richiesta.url);
  if (url.origin !== self.location.origin) return;

  // Rete per prima (così arriva sempre l'ultima versione dell'app), cache solo
  // come riserva quando si è offline.
  evento.respondWith(
    fetch(richiesta)
      .then((rete) => {
        if (rete && rete.ok) {
          const copia = rete.clone();
          caches.open(NOME_CACHE).then((cache) => cache.put(richiesta, copia));
        }
        return rete;
      })
      .catch(() => caches.match(richiesta))
  );
});
