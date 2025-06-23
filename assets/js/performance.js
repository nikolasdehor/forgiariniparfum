// Performance Optimization Module
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.optimizeVideoLoading();
        this.preloadCriticalResources();
        this.setupIntersectionObserver();
    }

    // Lazy Loading para imagens
    setupLazyLoading() {
        // Verificar se o navegador suporta loading="lazy" nativo
        if ('loading' in HTMLImageElement.prototype) {
            // Usar lazy loading nativo
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.setAttribute('loading', 'lazy');
            });
        } else {
            // Fallback para navegadores antigos
            this.setupIntersectionObserverImages();
        }
    }

    // Intersection Observer para imagens (fallback)
    setupIntersectionObserverImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Otimizar carregamento de vídeo
    optimizeVideoLoading() {
        const heroVideo = document.getElementById('hero-video');
        if (heroVideo) {
            // Só carregar vídeo se não for mobile
            if (window.innerWidth > 768) {
                // Preload apenas metadata inicialmente
                heroVideo.preload = 'metadata';
                
                // Carregar vídeo quando estiver próximo da viewport
                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            heroVideo.preload = 'auto';
                            heroVideo.load();
                            videoObserver.unobserve(heroVideo);
                        }
                    });
                }, { rootMargin: '100px' });

                videoObserver.observe(heroVideo);
            } else {
                // Em mobile, usar imagem de fallback
                this.replaceVideoWithImage(heroVideo);
            }
        }
    }

    // Substituir vídeo por imagem em mobile
    replaceVideoWithImage(video) {
        const fallbackImage = document.createElement('img');
        fallbackImage.src = 'assets/images/hero-fallback.jpg';
        fallbackImage.alt = 'Forgiarini Parfum';
        fallbackImage.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
        `;
        
        video.parentNode.appendChild(fallbackImage);
        video.style.display = 'none';
    }

    // Preload recursos críticos
    preloadCriticalResources() {
        // Preload fontes críticas
        this.preloadFont('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        this.preloadFont('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        
        // Preload CSS crítico
        this.preloadCSS('assets/css/style.css');
    }

    preloadFont(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = 'style';
        link.onload = function() { this.rel = 'stylesheet'; };
        document.head.appendChild(link);
    }

    preloadCSS(href) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = 'style';
        document.head.appendChild(link);
    }

    // Observer para animações
    setupIntersectionObserver() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observar elementos que devem ser animados
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            animationObserver.observe(el);
        });
    }

    // Otimizar imagens dinamicamente
    static optimizeImage(img) {
        // Adicionar parâmetros de otimização se usando CDN
        if (img.src.includes('cloudinary') || img.src.includes('imagekit')) {
            const url = new URL(img.src);
            url.searchParams.set('f_auto', 'true');
            url.searchParams.set('q_auto', 'true');
            img.src = url.toString();
        }
    }

    // Monitorar Core Web Vitals
    measureWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                console.log('FID:', entry.processingStart - entry.startTime);
            });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PerformanceOptimizer();
    });
} else {
    new PerformanceOptimizer();
}
