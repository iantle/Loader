/* Service worker — mahdollistaa asennuksen ja offline-käytön.
   Strategia: network-first. Haetaan aina tuorein verkosta ja päivitetään
   välimuisti; offline-tilassa (tai jos verkko pettää) käytetään välimuistia.
   Näin sivustopäivitykset näkyvät heti, kun laite on verkossa. */
const CACHE = "loader-app-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Talleta tuore vastaus välimuistiin offline-käyttöä varten
        if (res && res.ok && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        // Verkko ei käytettävissä → tarjoile välimuistista
        caches.match(req).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
