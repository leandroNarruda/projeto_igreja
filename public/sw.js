const CACHE_NAME = 'projeto-igreja-v1';
const VERSION_URL = '/version.json';
const STATIC_ASSETS = [
  '/',
  '/images/logos/logo_72.png',
  '/images/logos/logo_96.png',
  '/images/logos/logo_128.png',
  '/images/logos/logo_144.png',
  '/images/logos/logo_152.png',
  '/images/logos/logo_192.png',
  '/images/logos/logo_384.png',
  '/images/logos/logo_512.png',
  '/images/logos/logo_1024.png',
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
      // Limpa caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
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
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição for bem-sucedida, atualiza o cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
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


