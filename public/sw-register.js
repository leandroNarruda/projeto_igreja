// Registro do Service Worker
if ('serviceWorker' in navigator) {
  // Registra em localhost (desenvolvimento) ou HTTPS (produção)
  const isLocalhost = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '[::1]';
  const isHttps = window.location.protocol === 'https:';

  if (isLocalhost || isHttps) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration.scope);

          // Aguarda o service worker estar pronto
          if (registration.installing) {
            registration.installing.addEventListener('statechange', () => {
              if (registration.installing.state === 'activated') {
                registration.installing.postMessage({ type: 'START_VERSION_CHECK' });
              }
            });
          } else if (registration.waiting) {
            registration.waiting.postMessage({ type: 'START_VERSION_CHECK' });
          } else if (registration.active) {
            registration.active.postMessage({ type: 'START_VERSION_CHECK' });
          }

          // Escuta atualizações do service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  console.log('Nova versão do Service Worker ativada');
                  // Recarrega a página quando nova versão é ativada
                  window.location.reload();
                }
              });
            }
          });

          // Verifica atualizações periodicamente
          setInterval(() => {
            registration.update();
          }, 60000); // A cada 1 minuto
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    });

    // Escuta mensagens do service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
        console.log('Nova versão disponível:', event.data.version);
        // Força reload imediato
        window.location.reload();
      } else if (event.data && event.data.type === 'FORCE_RELOAD') {
        window.location.reload();
      }
    });
  } else {
    // Sem HTTPS e não é localhost, apenas loga
    console.log('Service Worker requer HTTPS em produção');
  }
}

