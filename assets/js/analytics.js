// Analytics and Monitoring System
class AnalyticsManager {
    constructor() {
        this.config = {
            // Configurações do Google Analytics (substitua pelo seu ID)
            gaId: 'G-XXXXXXXXXX', // Substitua pelo seu Google Analytics ID
            
            // Configurações de privacidade
            respectDNT: true, // Respeitar Do Not Track
            anonymizeIP: true,
            cookieConsent: false,
            
            // Configurações de monitoramento
            trackErrors: true,
            trackPerformance: true,
            trackUserInteractions: true
        };
        
        this.init();
    }

    async init() {
        // Verificar consentimento de cookies
        await this.checkCookieConsent();
        
        if (this.config.cookieConsent) {
            this.initGoogleAnalytics();
        }
        
        // Sempre inicializar monitoramento básico (sem cookies)
        this.initErrorTracking();
        this.initPerformanceTracking();
        this.initUserInteractionTracking();
        this.initCustomEvents();
    }

    // Verificar consentimento de cookies
    async checkCookieConsent() {
        // Verificar Do Not Track
        if (this.config.respectDNT && navigator.doNotTrack === '1') {
            console.log('Analytics: Do Not Track detectado, analytics desabilitado');
            return;
        }

        // Verificar consentimento salvo
        const consent = localStorage.getItem('cookie-consent');
        if (consent === 'accepted') {
            this.config.cookieConsent = true;
            return;
        }

        // Mostrar banner de consentimento se necessário
        if (consent === null) {
            this.showCookieConsentBanner();
        }
    }

    // Mostrar banner de consentimento
    showCookieConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <p>
                    <i class="fas fa-cookie-bite"></i>
                    Usamos cookies para melhorar sua experiência e analisar o uso do site. 
                    <a href="#privacy" class="privacy-link">Saiba mais</a>
                </p>
                <div class="cookie-consent-buttons">
                    <button id="accept-cookies" class="btn btn-primary btn-small">Aceitar</button>
                    <button id="reject-cookies" class="btn btn-secondary btn-small">Rejeitar</button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('accept-cookies').addEventListener('click', () => {
            this.acceptCookies();
            banner.remove();
        });

        document.getElementById('reject-cookies').addEventListener('click', () => {
            this.rejectCookies();
            banner.remove();
        });
    }

    // Aceitar cookies
    acceptCookies() {
        localStorage.setItem('cookie-consent', 'accepted');
        this.config.cookieConsent = true;
        this.initGoogleAnalytics();
        console.log('Analytics: Cookies aceitos, Google Analytics inicializado');
    }

    // Rejeitar cookies
    rejectCookies() {
        localStorage.setItem('cookie-consent', 'rejected');
        this.config.cookieConsent = false;
        console.log('Analytics: Cookies rejeitados, apenas analytics básico');
    }

    // Inicializar Google Analytics
    initGoogleAnalytics() {
        if (!this.config.gaId || this.config.gaId === 'G-XXXXXXXXXX') {
            console.log('Analytics: Google Analytics ID não configurado');
            return;
        }

        // Carregar gtag
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.gaId}`;
        document.head.appendChild(script);

        // Configurar gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        gtag('js', new Date());
        gtag('config', this.config.gaId, {
            anonymize_ip: this.config.anonymizeIP,
            cookie_flags: 'SameSite=Strict;Secure',
            send_page_view: true
        });

        console.log('Analytics: Google Analytics inicializado');
    }

    // Monitoramento de erros
    initErrorTracking() {
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'promise_rejection',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack
            });
        });
    }

    // Monitoramento de performance
    initPerformanceTracking() {
        // Core Web Vitals
        this.trackWebVitals();
        
        // Performance Navigation Timing
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.trackPageLoadMetrics();
            }, 0);
        });
    }

    // Rastrear Web Vitals
    trackWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.trackMetric('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                const fid = entry.processingStart - entry.startTime;
                this.trackMetric('FID', fid);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.trackMetric('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    // Rastrear métricas de carregamento
    trackPageLoadMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.trackMetric('TTFB', navigation.responseStart - navigation.requestStart);
            this.trackMetric('DOM_Load', navigation.domContentLoadedEventEnd - navigation.navigationStart);
            this.trackMetric('Page_Load', navigation.loadEventEnd - navigation.navigationStart);
        }
    }

    // Rastrear interações do usuário
    initUserInteractionTracking() {
        // Cliques em botões importantes
        document.addEventListener('click', (event) => {
            const target = event.target.closest('button, a[href]');
            if (target) {
                const action = target.textContent.trim() || target.getAttribute('aria-label') || 'Unknown';
                this.trackEvent('click', {
                    element_type: target.tagName.toLowerCase(),
                    element_text: action,
                    element_id: target.id || null,
                    element_class: target.className || null
                });
            }
        });

        // Scroll depth
        this.trackScrollDepth();
        
        // Tempo na página
        this.trackTimeOnPage();
    }

    // Rastrear profundidade de scroll
    trackScrollDepth() {
        const thresholds = [25, 50, 75, 90, 100];
        const tracked = new Set();

        const checkScrollDepth = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    tracked.add(threshold);
                    this.trackEvent('scroll_depth', { percent: threshold });
                }
            });
        };

        window.addEventListener('scroll', this.throttle(checkScrollDepth, 500));
    }

    // Rastrear tempo na página
    trackTimeOnPage() {
        const startTime = Date.now();
        
        const trackTime = () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            this.trackEvent('time_on_page', { seconds: timeSpent });
        };

        // Rastrear quando sair da página
        window.addEventListener('beforeunload', trackTime);
        
        // Rastrear a cada 30 segundos
        setInterval(() => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (timeSpent % 30 === 0) {
                this.trackEvent('time_milestone', { seconds: timeSpent });
            }
        }, 1000);
    }

    // Eventos customizados
    initCustomEvents() {
        // Rastrear visualização de catálogo
        document.addEventListener('catalog-viewed', (event) => {
            this.trackEvent('catalog_viewed', {
                catalog_name: event.detail?.catalogName || 'unknown'
            });
        });

        // Rastrear cliques no WhatsApp
        document.addEventListener('click', (event) => {
            const target = event.target.closest('a[href*="wa.me"]');
            if (target) {
                this.trackEvent('whatsapp_click', {
                    source: target.closest('section')?.id || 'unknown'
                });
            }
        });
    }

    // Rastrear evento
    trackEvent(eventName, parameters = {}) {
        // Google Analytics (se disponível)
        if (this.config.cookieConsent && window.gtag) {
            gtag('event', eventName, parameters);
        }

        // Log local (sempre)
        console.log('Analytics Event:', eventName, parameters);
        
        // Armazenar localmente para análise (sem dados pessoais)
        this.storeEventLocally(eventName, parameters);
    }

    // Rastrear métrica
    trackMetric(metricName, value) {
        const data = {
            metric: metricName,
            value: Math.round(value),
            timestamp: Date.now(),
            url: window.location.pathname
        };

        // Google Analytics
        if (this.config.cookieConsent && window.gtag) {
            gtag('event', 'web_vitals', {
                metric_name: metricName,
                metric_value: Math.round(value)
            });
        }

        console.log('Analytics Metric:', data);
        this.storeEventLocally('metric', data);
    }

    // Rastrear erro
    trackError(errorData) {
        const data = {
            ...errorData,
            timestamp: Date.now(),
            url: window.location.pathname,
            userAgent: navigator.userAgent
        };

        // Google Analytics
        if (this.config.cookieConsent && window.gtag) {
            gtag('event', 'exception', {
                description: errorData.message,
                fatal: false
            });
        }

        console.error('Analytics Error:', data);
        this.storeEventLocally('error', data);
    }

    // Armazenar evento localmente
    storeEventLocally(type, data) {
        try {
            const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
            events.push({
                type,
                data,
                timestamp: Date.now()
            });

            // Manter apenas os últimos 100 eventos
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }

            localStorage.setItem('analytics_events', JSON.stringify(events));
        } catch (error) {
            console.error('Erro ao armazenar evento:', error);
        }
    }

    // Utilitário: throttle
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Obter relatório de analytics local
    getLocalAnalytics() {
        try {
            return JSON.parse(localStorage.getItem('analytics_events') || '[]');
        } catch (error) {
            console.error('Erro ao obter analytics local:', error);
            return [];
        }
    }

    // Limpar dados locais
    clearLocalAnalytics() {
        localStorage.removeItem('analytics_events');
        console.log('Analytics locais limpos');
    }
}

// CSS para banner de cookies
const cookieCSS = `
    .cookie-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        padding: 20px;
        z-index: 10000;
        animation: slideInUp 0.3s ease;
    }
    
    .cookie-consent-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
    }
    
    .cookie-consent-content p {
        margin: 0;
        flex-grow: 1;
    }
    
    .privacy-link {
        color: #4CAF50;
        text-decoration: underline;
    }
    
    .cookie-consent-buttons {
        display: flex;
        gap: 10px;
    }
    
    @keyframes slideInUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
    }
    
    @media (max-width: 768px) {
        .cookie-consent-content {
            flex-direction: column;
            text-align: center;
        }
        
        .cookie-consent-buttons {
            width: 100%;
            justify-content: center;
        }
    }
`;

// Adicionar CSS
const style = document.createElement('style');
style.textContent = cookieCSS;
document.head.appendChild(style);

// Inicializar Analytics Manager
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.analyticsManager = new AnalyticsManager();
    });
} else {
    window.analyticsManager = new AnalyticsManager();
}
