const NOME_CACHE = "diario-didattico-v4";
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

  evento.respondWith(
    caches.match(richiesta).then((risposta) => {
      if (risposta) return risposta;
      return fetch(richiesta)
        .then((rete) => {
          const copia = rete.clone();
          caches.open(NOME_CACHE).then((cache) => cache.put(richiesta, copia));
          return rete;
        })
        .catch(() => risposta);
    })
  );
});
