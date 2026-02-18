const CACHE_NAME = 'projeto-igreja-v5';
const VERSION_URL = '/version.json';
const STATIC_ASSETS = [
  '/',
  '/images/logos/logo_192.png',
  '/images/logos/logo_512.png',
  '/images/logos/logo_72_opaque.png',
  '/images/logos/logo_96_opaque.png',
  '/images/logos/logo_128_opaque.png',
  '/images/logos/logo_144_opaque.png',
  '/images/logos/logo_152_opaque.png',
  '/images/logos/logo_192_opaque.png',
  '/images/logos/logo_384_opaque.png',
  '/images/logos/logo_512_opaque.png',
  '/images/logos/logo_1024_opaque.png',
  '/images/logos/logo_192_maskable.png',
  '/images/logos/logo_512_maskable.png',
  '/images/backgrounds/background_1.jpeg',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Força ativação imediata
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpa TODOS os caches antigos (incluindo o atual se o nome mudou)
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Deleta todos os caches que não correspondem ao nome atual
            if (cacheName !== CACHE_NAME) {
              console.log('Deletando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Assume controle imediato de todas as páginas
      self.clients.claim(),
      // Inicia verificação de atualizações
      checkForUpdates().then(() => {
        // Inicia verificação periódica após ativação
        checkInterval = setInterval(checkForUpdates, 30000);
      })
    ])
  );
});

// Estratégia: Network First, fallback para Cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Só cacheia respostas bem-sucedidas (status 200-299)
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tenta buscar do cache
        return caches.match(event.request);
      })
  );
});

// Verificação periódica de atualizações
let currentVersion = null;
let checkInterval = null;

async function checkForUpdates() {
  try {
    const response = await fetch(VERSION_URL + '?t=' + Date.now());
    const data = await response.json();
    const newVersion = data.commitHash;

    if (currentVersion === null) {
      // Primeira verificação, apenas armazena a versão
      currentVersion = newVersion;
    } else if (currentVersion !== newVersion) {
      // Nova versão detectada!
      currentVersion = newVersion;

      // Limpa o cache antigo
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );

      // Notifica todos os clientes para recarregar
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'NEW_VERSION_AVAILABLE',
          version: newVersion
        });
      });

      // Força reload de todos os clientes
      clients.forEach((client) => {
        if (client.navigate) {
          client.navigate(client.url);
        } else {
          client.postMessage({ type: 'FORCE_RELOAD' });
        }
      });
    }
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error);
  }
}

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Bom de lição', body: event.data.text() };
  }

  const options = {
    body: data.body || '',
    icon: data.icon || '/images/logos/logo_192.png',
    badge: data.badge || '/images/logos/logo_96.png',
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Bom de lição', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Verifica atualizações a cada 30 segundos
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_VERSION_CHECK') {
    // Inicia verificação periódica
    checkForUpdates();
    checkInterval = setInterval(checkForUpdates, 30000); // 30 segundos
  } else if (event.data && event.data.type === 'STOP_VERSION_CHECK') {
    // Para verificação periódica
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  } else if (event.data && event.data.type === 'CHECK_NOW') {
    // Verifica imediatamente
    checkForUpdates();
  }
});


