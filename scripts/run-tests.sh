#!/bin/bash

# Script para executar testes locais do Forgiarini Parfum
# ======================================================

echo "🧪 Executando testes locais para Forgiarini Parfum"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "index.html" ]; then
    print_error "Este script deve ser executado na raiz do projeto"
    exit 1
fi

# Contador de testes
TESTS_PASSED=0
TESTS_FAILED=0

# Função para executar teste
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_status "Executando: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((TESTS_PASSED++))
    else
        print_error "$test_name"
        ((TESTS_FAILED++))
    fi
}

echo ""
print_status "Iniciando verificações de qualidade..."
echo ""

# Teste 1: Verificar se arquivos essenciais existem
print_status "1. Verificando arquivos essenciais..."
run_test "index.html existe" "[ -f 'index.html' ]"
run_test "admin.html existe" "[ -f 'admin.html' ]"
run_test "CSS principal existe" "[ -f 'assets/css/style.css' ]"
run_test "JavaScript principal existe" "[ -f 'assets/js/script.js' ]"
run_test "Manifest PWA existe" "[ -f 'manifest.json' ]"
run_test "Service Worker existe" "[ -f 'sw.js' ]"
run_test ".htaccess existe" "[ -f '.htaccess' ]"

echo ""

# Teste 2: Verificar estrutura HTML
print_status "2. Verificando estrutura HTML..."
run_test "HTML tem DOCTYPE" "grep -q '<!DOCTYPE html>' index.html"
run_test "HTML tem meta viewport" "grep -q 'name=\"viewport\"' index.html"
run_test "HTML tem meta description" "grep -q 'name=\"description\"' index.html"
run_test "HTML tem title" "grep -q '<title>' index.html"
run_test "HTML tem lang attribute" "grep -q 'lang=\"pt-BR\"' index.html"

echo ""

# Teste 3: Verificar links e recursos
print_status "3. Verificando links e recursos..."
run_test "Links do WhatsApp estão corretos" "grep -q 'wa.me/554284099552' index.html"
run_test "CSS está linkado" "grep -q 'assets/css/style.css' index.html"
run_test "JavaScript está linkado" "grep -q 'assets/js/script.js' index.html"
run_test "Favicon está definido" "grep -q 'favicon' index.html"

echo ""

# Teste 4: Verificar acessibilidade
print_status "4. Verificando acessibilidade..."
run_test "Imagens têm alt text" "! grep -q '<img[^>]*src[^>]*>' index.html | grep -v 'alt='"
run_test "Links têm texto descritivo" "! grep -q '<a[^>]*href[^>]*></a>' index.html"
run_test "Botões têm texto ou aria-label" "! grep -q '<button[^>]*></button>' index.html"

echo ""

# Teste 5: Verificar segurança
print_status "5. Verificando segurança..."
run_test "Headers de segurança no .htaccess" "grep -q 'X-Frame-Options\|Content-Security-Policy' .htaccess"
run_test "Não há credenciais expostas" "! grep -r 'password\|secret\|key.*=' --include='*.js' --include='*.html' ."
run_test "HTTPS é forçado" "grep -q 'Strict-Transport-Security' .htaccess"

echo ""

# Teste 6: Verificar performance
print_status "6. Verificando performance..."

# Verificar tamanhos de arquivo
css_size=$(wc -c < "assets/css/style.css" 2>/dev/null || echo "0")
js_size=$(wc -c < "assets/js/script.js" 2>/dev/null || echo "0")

if [ "$css_size" -lt 100000 ]; then
    print_success "CSS principal tem tamanho adequado ($css_size bytes)"
    ((TESTS_PASSED++))
else
    print_warning "CSS principal é grande ($css_size bytes)"
    ((TESTS_FAILED++))
fi

if [ "$js_size" -lt 100000 ]; then
    print_success "JavaScript principal tem tamanho adequado ($js_size bytes)"
    ((TESTS_PASSED++))
else
    print_warning "JavaScript principal é grande ($js_size bytes)"
    ((TESTS_FAILED++))
fi

# Verificar compressão
run_test "Compressão GZIP configurada" "grep -q 'mod_deflate\|gzip' .htaccess"
run_test "Cache configurado" "grep -q 'mod_expires\|Cache-Control' .htaccess"

echo ""

# Teste 7: Verificar PWA
print_status "7. Verificando PWA..."
run_test "Manifest linkado no HTML" "grep -q 'rel=\"manifest\"' index.html"
run_test "Theme color definido" "grep -q 'name=\"theme-color\"' index.html"
run_test "Service Worker registrado" "grep -q 'serviceWorker' assets/js/*.js"

echo ""

# Teste 8: Verificar responsividade
print_status "8. Verificando responsividade..."
run_test "Media queries presentes" "grep -q '@media' assets/css/style.css"
run_test "Viewport meta tag correto" "grep -q 'width=device-width' index.html"
run_test "Flexbox ou Grid usado" "grep -q 'display.*flex\|display.*grid' assets/css/style.css"

echo ""

# Teste 9: Verificar SEO
print_status "9. Verificando SEO..."
run_test "Sitemap existe" "[ -f 'sitemap.xml' ]"
run_test "Robots.txt existe" "[ -f 'robots.txt' ]"
run_test "Open Graph tags presentes" "grep -q 'property=\"og:' index.html"
run_test "Structured data presente" "grep -q 'application/ld+json' index.html"

echo ""

# Teste 10: Verificar funcionalidades específicas
print_status "10. Verificando funcionalidades específicas..."
run_test "Sistema de upload PHP existe" "[ -f 'assets/php/upload_catalog.php' ]"
run_test "Sistema de segurança existe" "[ -f 'assets/php/security.php' ]"
run_test "Analytics configurado" "[ -f 'assets/js/analytics.js' ]"

echo ""

# Resultados finais
echo "=================================================="
print_status "Resultados dos Testes:"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo "📊 Total de testes: $TOTAL_TESTS"
echo "✅ Passou: $TESTS_PASSED"
echo "❌ Falhou: $TESTS_FAILED"
echo "📈 Taxa de sucesso: $SUCCESS_RATE%"

echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    print_success "🎉 Todos os testes passaram! O projeto está pronto para deploy."
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    print_warning "⚠️  A maioria dos testes passou, mas há algumas questões a resolver."
    exit 0
else
    print_error "❌ Muitos testes falharam. Revise o projeto antes do deploy."
    exit 1
fi
