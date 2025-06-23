// DOM Elements
const header = document.querySelector('.header');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const body = document.body;

// Função para buscar o último catálogo PDF
async function getLatestCatalog() {
    try {
        // Em um ambiente de produção, isso seria feito através de uma chamada AJAX para um script no servidor
        // Esta é uma implementação simulada para demonstração
        return 'assets/pdf/perfume-catalog.pdf';
    } catch (error) {
        console.error('Erro ao carregar o catálogo:', error);
        return 'assets/pdf/perfume-catalog.pdf'; // Fallback para o arquivo padrão
    }
}

// Create mobile navigation menu
const createMobileNav = () => {
    const mobileNav = document.createElement('div');
    mobileNav.classList.add('mobile-nav');

    const closeButton = document.createElement('div');
    closeButton.classList.add('close-menu');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    mobileNav.appendChild(closeButton);

    // Clone the main navigation links
    const mainNavUl = document.querySelector('.main-nav ul');
    const mobileNavUl = mainNavUl.cloneNode(true);
    mobileNav.appendChild(mobileNavUl);

    body.appendChild(mobileNav);

    // Event listeners for mobile menu
    mobileMenuToggle.addEventListener('click', () => {
        mobileNav.classList.add('active');
        body.style.overflow = 'hidden';
    });

    closeButton.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        body.style.overflow = '';
    });

    // Close menu when clicking on a link
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            body.style.overflow = '';
        });
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createMobileNav();
    headerScrollEffect();
    smoothScrolling();
    revealOnScroll();
    handleMissingImages();
    handleParallax();

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