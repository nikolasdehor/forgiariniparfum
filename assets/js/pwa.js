// PWA Registration and Management
class PWAManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdateNotification();
        this.setupOfflineDetection();
    }

    // Registrar Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('Service Worker registrado com sucesso:', registration);

                // Verificar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Service Worker ativo
                if (registration.active) {
                    console.log('Service Worker ativo');
                }

            } catch (error) {
                console.error('Erro ao registrar Service Worker:', error);
            }
        } else {
            console.log('Service Worker não suportado neste navegador');
        }
    }

    // Configurar prompt de instalação
    setupInstallPrompt() {
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Prompt de instalação disponível');
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });

        // Detectar se já está instalado
        window.addEventListener('appinstalled', () => {
            console.log('PWA instalado com sucesso');
            this.hideInstallButton();
            this.showInstalledMessage();
        });
    }

    // Mostrar botão de instalação
    showInstallButton(deferredPrompt) {
        // Criar botão de instalação se não existir
        let installButton = document.getElementById('install-button');
        
        if (!installButton) {
            installButton = document.createElement('button');
            installButton.id = 'install-button';
            installButton.className = 'install-button';
            installButton.innerHTML = `
                <i class="fas fa-download"></i>
                Instalar App
            `;
            installButton.setAttribute('aria-label', 'Instalar aplicativo no dispositivo');
            
            // Adicionar ao hero ou footer
            const heroContent = document.querySelector('.hero-content .cta-buttons');
            if (heroContent) {
                heroContent.appendChild(installButton);
            }
        }

        installButton.style.display = 'inline-block';
        
        installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('Usuário aceitou instalar o PWA');
                } else {
                    console.log('Usuário recusou instalar o PWA');
                }
                
                deferredPrompt = null;
                this.hideInstallButton();
            }
        });
    }

    // Esconder botão de instalação
    hideInstallButton() {
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    // Mostrar mensagem de instalação bem-sucedida
    showInstalledMessage() {
        const message = document.createElement('div');
        message.className = 'pwa-message success';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            App instalado com sucesso! Agora você pode acessá-lo diretamente da tela inicial.
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    // Configurar notificação de atualização
    setupUpdateNotification() {
        // Escutar mensagens do service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                this.showUpdateNotification();
            }
        });
    }

    // Mostrar notificação de atualização
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'pwa-update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <i class="fas fa-sync-alt"></i>
                <span>Nova versão disponível!</span>
                <button id="update-button" class="btn btn-small">Atualizar</button>
                <button id="dismiss-update" class="btn btn-small btn-secondary">Depois</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Botão de atualizar
        document.getElementById('update-button').addEventListener('click', () => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            }
        });
        
        // Botão de dispensar
        document.getElementById('dismiss-update').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Detectar status offline/online
    setupOfflineDetection() {
        const updateOnlineStatus = () => {
            const isOnline = navigator.onLine;
            document.body.classList.toggle('offline', !isOnline);
            
            if (!isOnline) {
                this.showOfflineMessage();
            } else {
                this.hideOfflineMessage();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Verificar status inicial
        updateOnlineStatus();
    }

    // Mostrar mensagem offline
    showOfflineMessage() {
        let offlineMessage = document.getElementById('offline-message');
        
        if (!offlineMessage) {
            offlineMessage = document.createElement('div');
            offlineMessage.id = 'offline-message';
            offlineMessage.className = 'offline-message';
            offlineMessage.innerHTML = `
                <i class="fas fa-wifi"></i>
                Você está offline. Alguns recursos podem não estar disponíveis.
            `;
            
            document.body.appendChild(offlineMessage);
        }
        
        offlineMessage.style.display = 'block';
    }

    // Esconder mensagem offline
    hideOfflineMessage() {
        const offlineMessage = document.getElementById('offline-message');
        if (offlineMessage) {
            offlineMessage.style.display = 'none';
        }
    }

    // Obter informações do cache
    async getCacheInfo() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            return new Promise((resolve) => {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    resolve(event.data);
                };
                
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_CACHE_SIZE' },
                    [messageChannel.port2]
                );
            });
        }
        return null;
    }

    // Limpar cache (para desenvolvimento)
    async clearCache() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Cache limpo');
        }
    }
}

// CSS para PWA
const pwaCSS = `
    .install-button {
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        margin-left: 10px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    }
    
    .install-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
    }
    
    .pwa-message {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    }
    
    .pwa-update-notification {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #2196F3;
        color: white;
        padding: 15px;
        text-align: center;
        z-index: 10001;
        animation: slideInDown 0.3s ease;
    }
    
    .update-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
    }
    
    .offline-message {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #FF9800;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: none;
    }
    
    .offline .offline-message {
        display: block;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes slideInDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .install-button {
            margin: 10px 0 0 0;
            width: 100%;
        }
        
        .pwa-message {
            right: 10px;
            left: 10px;
            top: 10px;
        }
        
        .offline-message {
            left: 10px;
            right: 10px;
            bottom: 10px;
        }
    }
`;

// Adicionar CSS
const style = document.createElement('style');
style.textContent = pwaCSS;
document.head.appendChild(style);

// Inicializar PWA Manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PWAManager();
    });
} else {
    new PWAManager();
}
