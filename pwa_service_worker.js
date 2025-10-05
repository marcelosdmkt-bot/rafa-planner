const CACHE_NAME = 'tarefas-app-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png'
];

// Instalar Service Worker e cachear arquivos
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando arquivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar requisições e servir do cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache ou faz requisição na rede
        return response || fetch(event.request).then(fetchResponse => {
          // Cachear novas requisições
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
      .catch(() => {
        // Se falhar, retornar página offline (opcional)
        console.log('Service Worker: Falha ao buscar recurso');
      })
  );
});