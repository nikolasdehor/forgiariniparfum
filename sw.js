// Service Worker para Forgiarini Parfum PWA
const CACHE_NAME = 'forgiarini-parfum-v2.1';
const STATIC_CACHE = 'forgiarini-static-v2';
const DYNAMIC_CACHE = 'forgiarini-dynamic-v2';

// Arquivos para cache estático (sempre disponíveis offline)
const STATIC_FILES = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/ui-enhancements.css',
    '/assets/css/mobile-optimizations.css',
    '/assets/js/script.js',
    '/assets/js/ui-enhancements.js',
    '/assets/js/performance.js',
    '/assets/js/accessibility.js',
    '/assets/js/pwa.js',
    '/manifest.json',
    '/assets/images/hero-background.jpg',
    '/assets/images/signature-perfume.jpg',
    '/assets/images/perfume-laboratory.jpg',
    '/assets/images/preços.jpg',
    // Fontes essenciais
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Arquivos que podem ser cacheados dinamicamente
const DYNAMIC_FILES_PATTERNS = [
    /\/assets\/pdf\/.+\.pdf$/,
    /\/assets\/images\/.+\.(jpg|jpeg|png|gif|webp|svg)$/,
    /\/assets\/videos\/.+\.(mp4|webm)$/
];

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Cacheando arquivos estáticos');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Instalação concluída');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Erro na instalação', error);
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Remover caches antigos
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Removendo cache antigo', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Ativação concluída');
                return self.clients.claim();
            })
    );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorar requisições não-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar requisições para APIs externas específicas
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('cdnjs.cloudflare.com')) {
        return;
    }
    
    event.respondWith(
        handleRequest(request)
    );
});

// Estratégia de cache
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // 1. Cache First para arquivos estáticos
        if (isStaticFile(request.url)) {
            return await cacheFirst(request);
        }
        
        // 2. Network First para PDFs e conteúdo dinâmico
        if (isDynamicFile(request.url)) {
            return await networkFirst(request);
        }
        
        // 3. Stale While Revalidate para imagens
        if (isImageFile(request.url)) {
            return await staleWhileRevalidate(request);
        }
        
        // 4. Network First para tudo mais
        return await networkFirst(request);
        
    } catch (error) {
        console.error('Service Worker: Erro ao processar requisição', error);
        return await handleOfflineFallback(request);
    }
}

// Cache First Strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Cache apenas respostas bem-sucedidas
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request)
        .then(response => {
            if (response.status === 200) {
                const cache = caches.open(DYNAMIC_CACHE);
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(() => null);
    
    return cachedResponse || await networkResponsePromise;
}

// Fallback offline
async function handleOfflineFallback(request) {
    const url = new URL(request.url);
    
    // Fallback para páginas HTML
    if (request.headers.get('accept').includes('text/html')) {
        const cachedPage = await caches.match('/');
        if (cachedPage) {
            return cachedPage;
        }
    }
    
    // Fallback para imagens
    if (isImageFile(request.url)) {
        const fallbackImage = await caches.match('/assets/images/offline-fallback.svg');
        if (fallbackImage) {
            return fallbackImage;
        }
    }
    
    // Resposta genérica offline
    return new Response('Conteúdo não disponível offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
    });
}

// Verificar se é arquivo estático
function isStaticFile(url) {
    return STATIC_FILES.some(file => url.includes(file)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('fonts.googleapis.com') ||
           url.includes('cdnjs.cloudflare.com');
}

// Verificar se é arquivo dinâmico
function isDynamicFile(url) {
    return DYNAMIC_FILES_PATTERNS.some(pattern => pattern.test(url));
}

// Verificar se é imagem
function isImageFile(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

// Mensagens do cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        getCacheSize().then(size => {
            event.ports[0].postMessage({ cacheSize: size });
        });
    }
});

// Obter tamanho do cache
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// Notificações push (futuro)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/images/icons/icon-192x192.png',
            badge: '/assets/images/icons/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: data.data,
            actions: [
                {
                    action: 'view',
                    title: 'Ver Catálogo',
                    icon: '/assets/images/icons/view-icon.png'
                },
                {
                    action: 'close',
                    title: 'Fechar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
