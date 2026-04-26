const CACHE_NAME = "wastesouq-v1";
const STATIC_CACHE = "wastesouq-static-v1";
const DYNAMIC_CACHE = "wastesouq-dynamic-v1";

// Files to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/annonces",
  "/login",
  "/register",
  "/manifest.json",
];

// ─── INSTALL ──────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("📦 Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("🗑️ Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// ─── FETCH ────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and API calls
  if (request.method !== "GET") return;
  if (url.hostname === "localhost" && url.port === "5000") return;

  // API calls — network first, fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets — cache first
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages — network first
  event.respondWith(networkFirst(request));
});

// Cache first strategy
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline page for navigation requests
    if (request.destination === "document") {
      return caches.match("/") || new Response(`
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><title>WasteSouq — Hors ligne</title>
        <style>
          body { font-family: Inter, sans-serif; background: #0a2e1a; color: white;
                 display: flex; align-items: center; justify-content: center;
                 min-height: 100vh; margin: 0; text-align: center; }
          .card { background: rgba(255,255,255,0.1); padding: 40px; border-radius: 24px; }
          h1 { font-size: 2rem; margin-bottom: 8px; }
          p { color: rgba(255,255,255,0.6); }
          button { margin-top: 20px; padding: 12px 24px; background: #F4A261;
                   border: none; border-radius: 12px; color: white; font-weight: bold;
                   cursor: pointer; font-size: 1rem; }
        </style></head>
        <body>
          <div class="card">
            <div style="font-size:4rem">♻️</div>
            <h1>WasteSouq</h1>
            <p>Vous êtes hors ligne.<br/>Vérifiez votre connexion internet.</p>
            <button onclick="window.location.reload()">🔄 Réessayer</button>
          </div>
        </body></html>
      `, { headers: { "Content-Type": "text/html" } });
    }
    return new Response("Offline", { status: 503 });
  }
}

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Nouvelle notification WasteSouq",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: { url: data.url || "/" },
    actions: [
      { action: "open", title: "Voir" },
      { action: "close", title: "Ignorer" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "WasteSouq", options)
  );
});

// ─── NOTIFICATION CLICK ───────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ─── BACKGROUND SYNC ─────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-listings") {
    event.waitUntil(syncListings());
  }
});

async function syncListings() {
  console.log("🔄 Background sync: listings");
}