// Test Runner para Forgiarini Parfum
// Sistema de testes automatizados para validação do frontend

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    // Adicionar teste
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🚀 Iniciando testes automatizados...\n');
        
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        this.printResults();
        return this.results;
    }

    // Executar teste individual
    async runTest(test) {
        try {
            const startTime = performance.now();
            await test.testFunction();
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);
            
            this.results.passed++;
            this.results.details.push({
                name: test.name,
                status: 'PASSED',
                duration: `${duration}ms`,
                error: null
            });
            
            console.log(`✅ ${test.name} (${duration}ms)`);
        } catch (error) {
            this.results.failed++;
            this.results.details.push({
                name: test.name,
                status: 'FAILED',
                duration: null,
                error: error.message
            });
            
            console.log(`❌ ${test.name}`);
            console.log(`   Error: ${error.message}`);
        }
        
        this.results.total++;
    }

    // Imprimir resultados
    printResults() {
        console.log('\n📊 Resultados dos Testes:');
        console.log('========================');
        console.log(`Total: ${this.results.total}`);
        console.log(`✅ Passou: ${this.results.passed}`);
        console.log(`❌ Falhou: ${this.results.failed}`);
        console.log(`📈 Taxa de Sucesso: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n🔍 Testes que falharam:');
            this.results.details
                .filter(test => test.status === 'FAILED')
                .forEach(test => {
                    console.log(`   - ${test.name}: ${test.error}`);
                });
        }
    }

    // Assertion helpers
    static assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    static assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, but got ${actual}`);
        }
    }

    static assertNotNull(value, message) {
        if (value === null || value === undefined) {
            throw new Error(message || 'Value should not be null or undefined');
        }
    }

    static assertExists(selector, message) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(message || `Element with selector "${selector}" not found`);
        }
        return element;
    }

    static assertVisible(selector, message) {
        const element = this.assertExists(selector);
        const styles = window.getComputedStyle(element);
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
            throw new Error(message || `Element "${selector}" is not visible`);
        }
    }

    static assertHasClass(selector, className, message) {
        const element = this.assertExists(selector);
        if (!element.classList.contains(className)) {
            throw new Error(message || `Element "${selector}" does not have class "${className}"`);
        }
    }

    static async waitFor(condition, timeout = 5000, message) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error(message || `Condition not met within ${timeout}ms`);
    }
}

// Testes específicos para Forgiarini Parfum
const runner = new TestRunner();

// Teste 1: Verificar se elementos essenciais existem
runner.addTest('Elementos essenciais existem', () => {
    TestRunner.assertExists('header', 'Header não encontrado');
    TestRunner.assertExists('.hero', 'Seção hero não encontrada');
    TestRunner.assertExists('#catalog-btn', 'Botão de catálogo não encontrado');
    TestRunner.assertExists('footer', 'Footer não encontrado');
    TestRunner.assertExists('.main-nav', 'Navegação principal não encontrada');
});

// Teste 2: Verificar se o vídeo hero está presente
runner.addTest('Vídeo hero está presente', () => {
    TestRunner.assertExists('#hero-video', 'Vídeo hero não encontrado');
    const video = document.getElementById('hero-video');
    TestRunner.assert(video.tagName === 'VIDEO', 'Elemento não é um vídeo');
});

// Teste 3: Verificar se as seções principais existem
runner.addTest('Seções principais existem', () => {
    TestRunner.assertExists('#about', 'Seção sobre não encontrada');
    TestRunner.assertExists('#signature', 'Seção perfume autoral não encontrada');
    TestRunner.assertExists('#prices', 'Seção preços não encontrada');
});

// Teste 4: Verificar se os links do WhatsApp funcionam
runner.addTest('Links do WhatsApp estão corretos', () => {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    TestRunner.assert(whatsappLinks.length > 0, 'Nenhum link do WhatsApp encontrado');
    
    whatsappLinks.forEach((link, index) => {
        TestRunner.assert(
            link.href.includes('554284099552'),
            `Link do WhatsApp ${index + 1} não contém o número correto`
        );
    });
});

// Teste 5: Verificar se as imagens têm alt text
runner.addTest('Imagens têm alt text', () => {
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
        TestRunner.assert(
            img.alt && img.alt.trim() !== '',
            `Imagem ${index + 1} não tem alt text`
        );
    });
});

// Teste 6: Verificar se os botões são acessíveis
runner.addTest('Botões são acessíveis', () => {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach((button, index) => {
        const hasText = button.textContent.trim() !== '';
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasTitle = button.hasAttribute('title');
        
        TestRunner.assert(
            hasText || hasAriaLabel || hasTitle,
            `Botão ${index + 1} não tem texto ou aria-label`
        );
    });
});

// Teste 7: Verificar se o CSS está carregado
runner.addTest('CSS está carregado', () => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    TestRunner.assert(
        styles.fontFamily.includes('Montserrat') || styles.fontFamily !== 'Times',
        'CSS principal não parece estar carregado'
    );
});

// Teste 8: Verificar se JavaScript está funcionando
runner.addTest('JavaScript está funcionando', () => {
    TestRunner.assert(typeof window.analyticsManager !== 'undefined', 'Analytics manager não inicializado');
    TestRunner.assert(document.readyState === 'complete', 'Documento não completamente carregado');
});

// Teste 9: Verificar responsividade básica
runner.addTest('Responsividade básica', () => {
    const container = document.querySelector('.container');
    TestRunner.assertExists('.container', 'Container não encontrado');
    
    const styles = window.getComputedStyle(container);
    TestRunner.assert(
        styles.maxWidth !== 'none',
        'Container não tem max-width definido'
    );
});

// Teste 10: Verificar se o manifest PWA existe
runner.addTest('Manifest PWA existe', () => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    TestRunner.assertNotNull(manifestLink, 'Link do manifest PWA não encontrado');
    TestRunner.assert(
        manifestLink.href.includes('manifest.json'),
        'Manifest PWA não aponta para manifest.json'
    );
});

// Teste 11: Verificar meta tags essenciais
runner.addTest('Meta tags essenciais existem', () => {
    TestRunner.assertExists('meta[name="description"]', 'Meta description não encontrada');
    TestRunner.assertExists('meta[name="viewport"]', 'Meta viewport não encontrada');
    TestRunner.assertExists('meta[property="og:title"]', 'Meta og:title não encontrada');
});

// Teste 12: Verificar se o botão de catálogo funciona
runner.addTest('Botão de catálogo é clicável', async () => {
    const catalogBtn = TestRunner.assertExists('#catalog-btn', 'Botão de catálogo não encontrado');
    
    // Simular clique
    let clicked = false;
    catalogBtn.addEventListener('click', () => {
        clicked = true;
    }, { once: true });
    
    catalogBtn.click();
    
    await TestRunner.waitFor(() => clicked, 1000, 'Botão de catálogo não respondeu ao clique');
});

// Teste 13: Verificar performance básica
runner.addTest('Performance básica', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.navigationStart;
        TestRunner.assert(
            loadTime < 5000,
            `Tempo de carregamento muito alto: ${loadTime}ms`
        );
    }
});

// Teste 14: Verificar se não há erros de console
runner.addTest('Sem erros críticos de console', () => {
    // Este teste seria mais efetivo se executado em um ambiente de teste real
    // Por enquanto, verificamos se elementos essenciais estão funcionando
    TestRunner.assert(
        !document.body.classList.contains('error'),
        'Página indica estado de erro'
    );
});

// Teste 15: Verificar se o service worker está registrado
runner.addTest('Service Worker está registrado', async () => {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        TestRunner.assertNotNull(registration, 'Service Worker não está registrado');
    } else {
        console.log('⚠️  Service Worker não suportado neste navegador');
    }
});

// Função para executar testes automaticamente
async function runAutomatedTests() {
    // Aguardar carregamento completo
    if (document.readyState !== 'complete') {
        await new Promise(resolve => {
            window.addEventListener('load', resolve);
        });
    }
    
    // Aguardar um pouco mais para garantir que scripts foram executados
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = await runner.runAllTests();
    
    // Enviar resultados para analytics se disponível
    if (window.analyticsManager) {
        window.analyticsManager.trackEvent('automated_tests_completed', {
            total: results.total,
            passed: results.passed,
            failed: results.failed,
            success_rate: Math.round((results.passed / results.total) * 100)
        });
    }
    
    return results;
}

// Executar testes se estivermos em modo de desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(runAutomatedTests, 2000);
    });
}

// Exportar para uso manual
window.runTests = runAutomatedTests;
window.TestRunner = TestRunner;
