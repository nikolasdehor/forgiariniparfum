// DOM Elements
const header = document.querySelector('.header');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const body = document.body;

// Função para buscar o último catálogo PDF
async function getLatestCatalog() {
    try {
        const response = await fetch('assets/php/get_catalog_info.php');
        const data = await response.json();

        if (data.success && data.latest) {
            return data.latest.file_path;
        } else {
            // Fallback: tentar encontrar qualquer PDF na pasta
            const fallbackPaths = [
                'assets/pdf/perfume-catalog.pdf',
                'assets/pdf/catalogo.pdf',
                'assets/pdf/catalog.pdf'
            ];

            for (const path of fallbackPaths) {
                try {
                    const testResponse = await fetch(path, { method: 'HEAD' });
                    if (testResponse.ok) {
                        return path;
                    }
                } catch (e) {
                    // Continuar tentando outros caminhos
                }
            }

            // Se nenhum arquivo for encontrado, retornar o primeiro como fallback
            return fallbackPaths[0];
        }
    } catch (error) {
        console.error('Erro ao carregar o catálogo:', error);
        // Fallback para arquivo padrão
        return 'assets/pdf/perfume-catalog.pdf';
    }
}

// Função para obter informações de todos os catálogos
async function getAllCatalogs() {
    try {
        const response = await fetch('assets/php/get_catalog_info.php');
        const data = await response.json();

        if (data.success) {
            return data.catalogs || [];
        }
        return [];
    } catch (error) {
        console.error('Erro ao carregar catálogos:', error);
        return [];
    }
}

// Create mobile navigation menu
const createMobileNav = () => {
    // Create mobile navigation overlay
    const mobileNavOverlay = document.createElement('div');
    mobileNavOverlay.classList.add('mobile-nav-overlay');
    body.appendChild(mobileNavOverlay);

    const mobileNav = document.createElement('div');
    mobileNav.classList.add('mobile-nav');

    const closeButton = document.createElement('div');
    closeButton.classList.add('close-menu');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.setAttribute('role', 'button');
    closeButton.setAttribute('aria-label', 'Fechar menu de navegação');
    closeButton.setAttribute('tabindex', '0');
    mobileNav.appendChild(closeButton);

    // Clone the main navigation links
    const mainNavUl = document.querySelector('.main-nav ul');
    const mobileNavUl = mainNavUl.cloneNode(true);
    mobileNavUl.setAttribute('role', 'menu');
    mobileNav.appendChild(mobileNavUl);

    body.appendChild(mobileNav);

    // Improved mobile menu functionality
    const openMobileMenu = () => {
        mobileNav.classList.add('active');
        mobileNavOverlay.classList.add('active');
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.width = '100%';
        
        // Focus management for accessibility
        const firstFocusableElement = mobileNav.querySelector('a, button, [tabindex]');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
        
        // Add escape key listener
        document.addEventListener('keydown', handleEscapeKey);
    };

    const closeMobileMenu = () => {
        mobileNav.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';
        
        // Return focus to menu toggle
        mobileMenuToggle.focus();
        
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
    };

    const handleEscapeKey = (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
            closeMobileMenu();
        }
    };

    // Touch and click event listeners
    mobileMenuToggle.addEventListener('click', openMobileMenu);
    mobileMenuToggle.addEventListener('touchstart', (e) => {
        e.preventDefault();
        openMobileMenu();
    });

    closeButton.addEventListener('click', closeMobileMenu);
    closeButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeMobileMenu();
    });

    // Close menu when clicking on overlay
    mobileNavOverlay.addEventListener('click', closeMobileMenu);
    mobileNavOverlay.addEventListener('touchstart', (e) => {
        e.preventDefault();
        closeMobileMenu();
    });

    // Close menu when clicking on a link
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add small delay for smooth transition
            setTimeout(closeMobileMenu, 150);
        });
        
        link.addEventListener('touchstart', (e) => {
            // Add visual feedback for touch
            link.style.backgroundColor = 'rgba(166, 124, 82, 0.1)';
            setTimeout(() => {
                link.style.backgroundColor = '';
            }, 150);
        });
    });

    // Keyboard navigation support
    closeButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            closeMobileMenu();
        }
    });

    // Prevent body scroll when menu is open
    mobileNav.addEventListener('touchmove', (e) => {
        e.stopPropagation();
    });
};

// Header scroll effect
const headerScrollEffect = () => {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
};

// Smooth scrolling for anchor links
const smoothScrolling = () => {
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Reveal animation for sections on scroll
const revealOnScroll = () => {
    const revealElements = document.querySelectorAll('.about-section, .signature-section, .video-section, .prices-section, .footer');

    const revealHandler = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                element.classList.add('revealed');
            }
        });
    };

    // Set initial styles
    revealElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });

    // Create reveal class
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Add scroll event listener
    window.addEventListener('scroll', revealHandler);

    // Call once on load
    setTimeout(revealHandler, 100);
};

// Handle parallax effects
const handleParallax = () => {
    const parallaxItems = [
        { selector: '.about-image', speedFactor: 0.05 },
        { selector: '.signature-image', speedFactor: 0.03 },
        { selector: '.prices-image', speedFactor: 0.03 },
        { selector: '.video-container', speedFactor: 0.02 }
    ];

    const parallaxHandler = () => {
        const scrollPosition = window.pageYOffset;

        parallaxItems.forEach(item => {
            const elements = document.querySelectorAll(item.selector);

            elements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
                const elementCenter = elementTop + element.offsetHeight / 2;
                const distanceFromCenter = scrollPosition + window.innerHeight / 2 - elementCenter;

                const translateY = distanceFromCenter * item.speedFactor;

                // Apply subtle parallax effect
                element.style.transform = `perspective(1000px) translateY(${translateY}px) rotateY(${item.selector === '.about-image' ? '5deg' : '0'})`;
            });
        });
    };

    // Add scroll event listener with throttling for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                parallaxHandler();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Call once on load
    parallaxHandler();
};

// Handle missing images with fallback gradients
const handleMissingImages = () => {
    // Set fallbacks for signature section image
    const signatureImage = document.querySelector('.signature-image img');
    if (signatureImage) {
        // Verificar se a imagem existe
        const img = new Image();
        img.onload = function() {
            // Imagem existe, não fazer nada
        };
        img.onerror = function() {
            // Imagem não existe, adicionar um fallback
            signatureImage.style.display = 'none';

            const signatureImageContainer = document.querySelector('.signature-image');
            signatureImageContainer.style.background = 'var(--gold-gradient)';
            signatureImageContainer.style.minHeight = '350px';
            signatureImageContainer.style.display = 'flex';
            signatureImageContainer.style.alignItems = 'center';
            signatureImageContainer.style.justifyContent = 'center';

            // Criar um elemento de texto centralizado
            const textElement = document.createElement('div');
            textElement.style.textAlign = 'center';
            textElement.style.color = 'white';
            textElement.style.fontFamily = "'Playfair Display', serif";
            textElement.style.padding = '2rem';
            textElement.innerHTML = `
                <div style="width: 60px; height: 60px; margin: 0 auto 20px; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-spray-can-sparkles" style="font-size: 24px;"></i>
                </div>
                <h3 style="color: white; margin-bottom: 15px; font-size: 1.8rem;">Sexy By Forgiarini</h3>
                <p style="opacity: 0.9; font-size: 0.95rem; font-weight: 300;">Nossa fragrância exclusiva desenvolvida para encantar os sentidos</p>
            `;

            signatureImageContainer.appendChild(textElement);
        };
        img.src = signatureImage.src;
    }

    // Set fallback for about section image
    const aboutImage = document.querySelector('.about-image img');
    if (aboutImage) {
        // Verificar se a imagem existe
        const img = new Image();
        img.onload = function() {
            // Imagem existe, adicionar efeito de paralax mais suave
            aboutImage.style.transition = 'transform 0.5s ease-out';

            const aboutImageContainer = document.querySelector('.about-image');
            aboutImageContainer.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = aboutImageContainer.getBoundingClientRect();
                const x = (e.clientX - left) / width - 0.5;
                const y = (e.clientY - top) / height - 0.5;

                aboutImage.style.transform = `scale(1.05) translate(${x * 10}px, ${y * 10}px)`;
            });

            aboutImageContainer.addEventListener('mouseleave', () => {
                aboutImage.style.transform = 'scale(1)';
            });
        };
        img.onerror = function() {
            // Imagem não existe, adicionar um fallback
            aboutImage.style.display = 'none';

            const aboutImageContainer = document.querySelector('.about-image');
            aboutImageContainer.style.background = 'var(--gold-gradient)';
            aboutImageContainer.style.minHeight = '350px';
            aboutImageContainer.style.display = 'flex';
            aboutImageContainer.style.alignItems = 'center';
            aboutImageContainer.style.justifyContent = 'center';

            // Criar um elemento de texto centralizado
            const textElement = document.createElement('div');
            textElement.style.textAlign = 'center';
            textElement.style.color = 'white';
            textElement.style.fontFamily = "'Playfair Display', serif";
            textElement.style.padding = '2rem';
            textElement.innerHTML = `
                <div style="width: 60px; height: 60px; margin: 0 auto 20px; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-flask" style="font-size: 24px;"></i>
                </div>
                <h3 style="color: white; margin-bottom: 15px; font-size: 1.8rem;">Nossa Expertise</h3>
                <p style="opacity: 0.9; font-size: 0.95rem; font-weight: 300;">Combinamos ciência e arte para criar fragrâncias verdadeiramente excepcionais</p>
            `;

            aboutImageContainer.appendChild(textElement);
        };
        img.src = aboutImage.src;
    }
};

// Mobile optimization utilities
const MobileOptimizations = {
    // Detect if user is on mobile device
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768 ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    },

    // Optimize video playback for mobile
    optimizeVideoForMobile: () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (MobileOptimizations.isMobile()) {
                // Reduce video quality on mobile to improve performance
                video.setAttribute('preload', 'metadata');
                
                // Pause video when not in viewport to save battery
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            video.play().catch(e => console.log('Video autoplay prevented'));
                        } else {
                            video.pause();
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(video);
                
                // Add touch controls optimization
                video.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                });
            }
        });
    },

    // Optimize images for mobile with better lazy loading
    optimizeLazyLoadingForMobile: () => {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Preload image
                        const imageLoader = new Image();
                        imageLoader.onload = () => {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            img.classList.add('loaded');
                        };
                        imageLoader.src = img.dataset.src;
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: MobileOptimizations.isMobile() ? '50px' : '100px'
            });

            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    },

    // Optimize scroll performance
    optimizeScrollPerformance: () => {
        let ticking = false;

        const updateScrollEffects = () => {
            // Only update header scroll effect
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        // Use passive scroll listener for better performance
        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    },

    // Add touch feedback for better UX
    addTouchFeedback: () => {
        const touchElements = document.querySelectorAll('.btn, .main-nav a, .social-icon');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            }, { passive: true });
            
            element.addEventListener('touchend', function(e) {
                setTimeout(() => {
                    this.style.transform = '';
                    this.style.transition = '';
                }, 100);
            }, { passive: true });
        });
    },

    // Optimize font loading for mobile
    optimizeFontLoading: () => {
        if (MobileOptimizations.isMobile()) {
            // Add font-display: swap for better performance
            const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
            fontLinks.forEach(link => {
                const url = new URL(link.href);
                url.searchParams.set('display', 'swap');
                link.href = url.toString();
            });
        }
    },

    // Reduce animations on low-end devices
    respectReducedMotion: () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.style.setProperty('--transition', 'none');
            
            // Remove animations from videos
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.removeAttribute('autoplay');
            });
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile optimizations first
    MobileOptimizations.optimizeFontLoading();
    MobileOptimizations.respectReducedMotion();
    
    // Initialize core functionality
    createMobileNav();
    MobileOptimizations.optimizeScrollPerformance();
    smoothScrolling();
    revealOnScroll();
    handleMissingImages();
    handleParallax();
    
    // Initialize mobile-specific optimizations
    MobileOptimizations.optimizeVideoForMobile();
    MobileOptimizations.optimizeLazyLoadingForMobile();
    MobileOptimizations.addTouchFeedback();
    
    console.log('Forgiarini Parfum website loaded successfully!');
    
    // Performance monitoring for mobile
    if (MobileOptimizations.isMobile()) {
        // Monitor performance on mobile devices
        if ('connection' in navigator) {
            const connection = navigator.connection;
            console.log(`Network: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`);
            
            // Adjust features based on connection speed
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Disable non-essential animations and features for slow connections
                document.documentElement.style.setProperty('--transition', 'none');
                
                // Disable autoplay videos
                const videos = document.querySelectorAll('video[autoplay]');
                videos.forEach(video => {
                    video.removeAttribute('autoplay');
                    video.setAttribute('preload', 'none');
                });
            }
        }
    }
    MobileOptimizations.optimizeFontLoading();
    MobileOptimizations.respectReducedMotion();

    // Configurar o botão de catálogo para abrir o PDF mais recente
    const catalogBtn = document.getElementById('catalog-btn');
    if (catalogBtn) {
        catalogBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const catalogPath = await getLatestCatalog();
            window.open(catalogPath, '_blank');
        });
    }

    // Adicionar animação de pulse para o logo
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', () => {
            logo.style.animation = 'pulse 1s infinite';
        });

        logo.addEventListener('mouseleave', () => {
            logo.style.animation = '';
        });
    }
});

// Create background overlay for mobile menu
const createOverlay = () => {
    const overlay = document.createElement('div');
    overlay.classList.add('mobile-overlay');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1500';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';
    overlay.style.backdropFilter = 'blur(5px)';

    body.appendChild(overlay);

    return overlay;
};

// Initialize the overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = createOverlay();

    mobileMenuToggle.addEventListener('click', () => {
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
    });

    overlay.addEventListener('click', () => {
        const mobileNav = document.querySelector('.mobile-nav');
        mobileNav.classList.remove('active');
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        body.style.overflow = '';
    });

    const closeButton = document.querySelector('.close-menu');
    closeButton.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
    });
});