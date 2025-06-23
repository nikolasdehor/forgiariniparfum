// Accessibility Enhancement Module
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIALabels();
        this.setupSkipLinks();
        this.setupReducedMotion();
        this.setupHighContrast();
    }

    // Navegação por teclado
    setupKeyboardNavigation() {
        // Navegação por Tab melhorada
        document.addEventListener('keydown', (e) => {
            // ESC para fechar modais/overlays
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Enter/Space para ativar elementos clicáveis
            if (e.key === 'Enter' || e.key === ' ') {
                const focusedElement = document.activeElement;
                if (focusedElement.classList.contains('clickable') || 
                    focusedElement.hasAttribute('data-clickable')) {
                    e.preventDefault();
                    focusedElement.click();
                }
            }
        });

        // Adicionar indicadores visuais de foco
        document.addEventListener('focusin', (e) => {
            e.target.classList.add('keyboard-focused');
        });

        document.addEventListener('focusout', (e) => {
            e.target.classList.remove('keyboard-focused');
        });

        // Remover foco visual quando usar mouse
        document.addEventListener('mousedown', (e) => {
            e.target.classList.remove('keyboard-focused');
        });
    }

    // Gerenciamento de foco
    setupFocusManagement() {
        // Garantir que elementos interativos sejam focáveis
        const interactiveElements = document.querySelectorAll(
            'button, a, input, select, textarea, [tabindex], [role="button"]'
        );

        interactiveElements.forEach(element => {
            if (!element.hasAttribute('tabindex') && 
                !element.disabled && 
                element.offsetParent !== null) {
                element.setAttribute('tabindex', '0');
            }
        });

        // Trap focus em modais (se houver)
        this.setupFocusTrap();
    }

    // Configurar ARIA labels
    setupARIALabels() {
        // Adicionar labels para elementos sem texto visível
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttons.forEach(button => {
            const icon = button.querySelector('i[class*="fa-"]');
            if (icon && !button.textContent.trim()) {
                const iconClass = icon.className;
                let label = 'Botão';
                
                if (iconClass.includes('fa-whatsapp')) label = 'Contato via WhatsApp';
                else if (iconClass.includes('fa-eye')) label = 'Visualizar catálogo';
                else if (iconClass.includes('fa-download')) label = 'Baixar catálogo';
                else if (iconClass.includes('fa-phone')) label = 'Telefone para contato';
                
                button.setAttribute('aria-label', label);
            }
        });

        // Adicionar roles apropriados
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            if (!section.hasAttribute('role')) {
                section.setAttribute('role', 'region');
            }
        });

        // Melhorar navegação
        const nav = document.querySelector('nav');
        if (nav && !nav.hasAttribute('role')) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', 'Menu principal');
        }
    }

    // Links de pular conteúdo
    setupSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link';
        skipLink.setAttribute('aria-label', 'Pular navegação e ir direto ao conteúdo');
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Adicionar ID ao conteúdo principal se não existir
        const main = document.querySelector('main') || document.querySelector('.hero');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }

    // Respeitar preferência de movimento reduzido
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.classList.add('reduce-motion');
            
            // Desabilitar animações CSS
            const style = document.createElement('style');
            style.textContent = `
                .reduce-motion *,
                .reduce-motion *::before,
                .reduce-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                    scroll-behavior: auto !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Escutar mudanças na preferência
        prefersReducedMotion.addEventListener('change', () => {
            if (prefersReducedMotion.matches) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }
        });
    }

    // Suporte a alto contraste
    setupHighContrast() {
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
        
        if (prefersHighContrast.matches) {
            document.documentElement.classList.add('high-contrast');
        }

        prefersHighContrast.addEventListener('change', () => {
            if (prefersHighContrast.matches) {
                document.documentElement.classList.add('high-contrast');
            } else {
                document.documentElement.classList.remove('high-contrast');
            }
        });
    }

    // Trap de foco para modais
    setupFocusTrap() {
        const modals = document.querySelectorAll('[role="dialog"], .modal');
        
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    // Fechar modais
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.active, [role="dialog"][aria-hidden="false"]');
        modals.forEach(modal => {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            
            // Retornar foco para o elemento que abriu o modal
            const trigger = document.querySelector(`[aria-controls="${modal.id}"]`);
            if (trigger) {
                trigger.focus();
            }
        });
    }

    // Anunciar mudanças para leitores de tela
    static announceToScreenReader(message, priority = 'polite') {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remover após anúncio
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Melhorar contraste de cores dinamicamente
    static improveContrast() {
        const elements = document.querySelectorAll('*');
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const bgColor = styles.backgroundColor;
            const textColor = styles.color;
            
            // Verificar contraste e ajustar se necessário
            if (this.getContrastRatio(bgColor, textColor) < 4.5) {
                element.style.filter = 'contrast(1.2)';
            }
        });
    }

    // Calcular ratio de contraste (simplificado)
    static getContrastRatio(bg, text) {
        // Implementação simplificada - em produção usar biblioteca específica
        return 4.5; // Placeholder
    }
}

// CSS para acessibilidade
const accessibilityCSS = `
    /* Skip link */
    .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
        border-radius: 0 0 4px 4px;
    }
    
    .skip-link:focus {
        top: 0;
    }
    
    /* Foco visível melhorado */
    .keyboard-focused {
        outline: 3px solid #4A90E2 !important;
        outline-offset: 2px !important;
    }
    
    /* Screen reader only */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    /* Alto contraste */
    .high-contrast {
        filter: contrast(1.5);
    }
    
    .high-contrast button,
    .high-contrast a {
        border: 2px solid currentColor;
    }
    
    /* Movimento reduzido */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
    
    /* Melhor visibilidade de foco */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
        outline: 3px solid #4A90E2;
        outline-offset: 2px;
    }
`;

// Adicionar CSS de acessibilidade
const style = document.createElement('style');
style.textContent = accessibilityCSS;
document.head.appendChild(style);

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AccessibilityEnhancer();
    });
} else {
    new AccessibilityEnhancer();
}
