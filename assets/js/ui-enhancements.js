// UI Enhancements and Micro-interactions
class UIEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLoadingStates();
        this.setupMicroInteractions();
        this.setupSmoothScrolling();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupFormEnhancements();
        this.setupTooltips();
        this.setupProgressIndicators();
        this.setupAnimationOnScroll();
    }

    // Estados de carregamento
    setupLoadingStates() {
        // Interceptar cliques em botões para mostrar loading
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn');
            if (button && !button.classList.contains('no-loading')) {
                this.showButtonLoading(button);
            }
        });

        // Loading para links externos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[target="_blank"]');
            if (link) {
                this.showLinkLoading(link);
            }
        });
    }

    // Mostrar loading em botão
    showButtonLoading(button) {
        const originalText = button.innerHTML;
        const loadingText = button.dataset.loading || 'Carregando...';
        
        button.classList.add('loading');
        button.disabled = true;
        button.innerHTML = `
            <span class="loading-spinner"></span>
            ${loadingText}
        `;

        // Restaurar após 2 segundos (ou quando a ação completar)
        setTimeout(() => {
            this.hideButtonLoading(button, originalText);
        }, 2000);
    }

    // Esconder loading do botão
    hideButtonLoading(button, originalText) {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = originalText;
    }

    // Loading para links
    showLinkLoading(link) {
        const icon = link.querySelector('i');
        if (icon) {
            const originalClass = icon.className;
            icon.className = 'fas fa-spinner fa-spin';
            
            setTimeout(() => {
                icon.className = originalClass;
            }, 1000);
        }
    }

    // Micro-interações
    setupMicroInteractions() {
        // Efeito ripple em botões
        this.addRippleEffect();
        
        // Animação de hover em cards
        this.addCardHoverEffects();
        
        // Efeito de shake em erros
        this.addShakeEffect();
        
        // Efeito de pulse em elementos importantes
        this.addPulseEffect();
    }

    // Efeito ripple
    addRippleEffect() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, button');
            if (button && !button.classList.contains('no-ripple')) {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    }

    // Efeitos de hover em cards
    addCardHoverEffects() {
        const cards = document.querySelectorAll('.about-image, .signature-image, .prices-image');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
                card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Efeito shake para erros
    addShakeEffect() {
        window.shakeElement = (element) => {
            element.classList.add('shake');
            setTimeout(() => {
                element.classList.remove('shake');
            }, 500);
        };
    }

    // Efeito pulse
    addPulseEffect() {
        const pulseElements = document.querySelectorAll('.pulse-on-load');
        
        pulseElements.forEach(element => {
            element.classList.add('pulse');
            setTimeout(() => {
                element.classList.remove('pulse');
            }, 2000);
        });
    }

    // Scroll suave melhorado
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Highlight temporário do elemento
                    target.classList.add('highlight');
                    setTimeout(() => {
                        target.classList.remove('highlight');
                    }, 2000);
                }
            }
        });
    }

    // Efeitos parallax
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-content, .video-background');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    // Efeitos de hover avançados
    setupHoverEffects() {
        // Efeito de tilt em imagens
        const tiltElements = document.querySelectorAll('.signature-image img, .about-image img');
        
        tiltElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    // Melhorias em formulários
    setupFormEnhancements() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Efeito de foco
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.classList.remove('focused');
                if (input.value) {
                    input.parentElement.classList.add('filled');
                } else {
                    input.parentElement.classList.remove('filled');
                }
            });
            
            // Validação em tempo real
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
        });
    }

    // Validação de input
    validateInput(input) {
        const value = input.value;
        const type = input.type;
        let isValid = true;
        
        switch (type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
            case 'tel':
                isValid = /^[\d\s\-\+\(\)]+$/.test(value);
                break;
            default:
                isValid = value.length > 0;
        }
        
        input.classList.toggle('valid', isValid && value.length > 0);
        input.classList.toggle('invalid', !isValid && value.length > 0);
    }

    // Tooltips
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    // Mostrar tooltip
    showTooltip(element) {
        const text = element.dataset.tooltip;
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
        
        setTimeout(() => {
            tooltip.classList.add('visible');
        }, 10);
    }

    // Esconder tooltip
    hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    // Indicadores de progresso
    setupProgressIndicators() {
        // Barra de progresso de scroll
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = scrolled + '%';
        });
        
        // Indicador de seção ativa
        this.setupSectionIndicator();
    }

    // Indicador de seção ativa
    setupSectionIndicator() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Animações ao fazer scroll
    setupAnimationOnScroll() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Notificações toast
    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;
        
        document.body.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto-remover
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
        
        // Botão de fechar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
    }

    // Modal simples
    static showModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${actions.map(action => `
                        <button class="btn ${action.class || ''}" data-action="${action.action}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Mostrar modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                UIEnhancer.hideModal(modal);
            }
            
            const action = e.target.dataset.action;
            if (action) {
                const actionHandler = actions.find(a => a.action === action);
                if (actionHandler && actionHandler.handler) {
                    actionHandler.handler();
                }
                UIEnhancer.hideModal(modal);
            }
        });
        
        return modal;
    }

    // Esconder modal
    static hideModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UIEnhancer();
    });
} else {
    new UIEnhancer();
}
