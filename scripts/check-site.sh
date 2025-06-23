#!/bin/bash

# Script para verificar se o site está funcionando corretamente
# ============================================================

echo "🌐 Verificando status do site Forgiarini Parfum"
echo "==============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs para testar
SITE_URL="https://forgiariniparfum.dehor.dev"
SITE_URL_HTTP="http://forgiariniparfum.dehor.dev"

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

# Função para verificar URL
check_url() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    print_status "Verificando $name..."
    
    # Verificar se responde
    if curl -f -s -L --max-time $timeout "$url" > /dev/null 2>&1; then
        print_success "$name está acessível"
        
        # Verificar tempo de resposta
        response_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time $timeout "$url" 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "   ⏱️  Tempo de resposta: ${response_time}s"
        fi
        
        return 0
    else
        print_error "$name não está acessível"
        return 1
    fi
}

# Função para verificar conteúdo
check_content() {
    local url=$1
    local expected=$2
    local name=$3
    
    print_status "Verificando conteúdo de $name..."
    
    content=$(curl -s -L --max-time 10 "$url" 2>/dev/null)
    if echo "$content" | grep -q "$expected"; then
        print_success "$name contém o conteúdo esperado"
        return 0
    else
        print_warning "$name não contém o conteúdo esperado"
        return 1
    fi
}

echo ""
print_status "Iniciando verificações..."
echo ""

# 1. Verificar conectividade básica
print_status "1. Verificando conectividade do domínio..."
if ping -c 3 forgiariniparfum.dehor.dev > /dev/null 2>&1; then
    print_success "Domínio responde ao ping"
else
    print_warning "Domínio não responde ao ping (pode ser normal)"
fi

echo ""

# 2. Verificar site principal
print_status "2. Verificando site principal..."
if check_url "$SITE_URL" "Site HTTPS"; then
    SITE_WORKS=true
    WORKING_URL="$SITE_URL"
elif check_url "$SITE_URL_HTTP" "Site HTTP"; then
    SITE_WORKS=true
    WORKING_URL="$SITE_URL_HTTP"
    print_warning "Site funciona apenas via HTTP"
else
    SITE_WORKS=false
    print_error "Site não está acessível"
fi

echo ""

# 3. Verificar recursos se o site estiver funcionando
if [ "$SITE_WORKS" = true ]; then
    print_status "3. Verificando recursos do site..."
    
    check_url "${WORKING_URL}/assets/css/style.css" "CSS principal"
    check_url "${WORKING_URL}/assets/js/script.js" "JavaScript principal"
    check_url "${WORKING_URL}/manifest.json" "PWA Manifest"
    check_url "${WORKING_URL}/sw.js" "Service Worker"
    check_url "${WORKING_URL}/admin.html" "Painel Admin"
    
    echo ""
    
    # 4. Verificar conteúdo
    print_status "4. Verificando conteúdo..."
    
    check_content "$WORKING_URL" "Forgiarini Parfum" "Título da página"
    check_content "$WORKING_URL" "wa.me/554284099552" "Link do WhatsApp"
    check_content "$WORKING_URL" "Ver Catálogo" "Botão de catálogo"
    
    echo ""
    
    # 5. Verificar headers de segurança
    print_status "5. Verificando headers de segurança..."
    
    headers=$(curl -I -s -L --max-time 10 "$WORKING_URL" 2>/dev/null)
    
    if echo "$headers" | grep -qi "x-frame-options"; then
        print_success "X-Frame-Options header presente"
    else
        print_warning "X-Frame-Options header ausente"
    fi
    
    if echo "$headers" | grep -qi "x-content-type-options"; then
        print_success "X-Content-Type-Options header presente"
    else
        print_warning "X-Content-Type-Options header ausente"
    fi
    
    if echo "$headers" | grep -qi "strict-transport-security"; then
        print_success "Strict-Transport-Security header presente"
    else
        print_warning "Strict-Transport-Security header ausente"
    fi
    
else
    print_error "Pulando verificações adicionais - site não acessível"
fi

echo ""

# 6. Verificar status do GitHub Actions
print_status "6. Informações adicionais..."

echo "🔗 URLs para verificação manual:"
echo "   Site: $SITE_URL"
echo "   Admin: $SITE_URL/admin.html"
echo "   GitHub: https://github.com/nikolasdehor/forgiariniparfum"
echo "   Actions: https://github.com/nikolasdehor/forgiariniparfum/actions"

echo ""

# 7. Resumo final
if [ "$SITE_WORKS" = true ]; then
    print_success "✅ Site está funcionando!"
    echo ""
    echo "🎯 Próximos passos:"
    echo "   1. Verificar se todas as funcionalidades estão operando"
    echo "   2. Testar upload de PDF no painel admin"
    echo "   3. Verificar analytics (se configurado)"
    echo "   4. Testar em diferentes dispositivos"
else
    print_error "❌ Site não está acessível"
    echo ""
    echo "🔧 Possíveis soluções:"
    echo "   1. Aguardar alguns minutos (propagação DNS/CDN)"
    echo "   2. Verificar configurações do servidor"
    echo "   3. Verificar logs do GitHub Actions"
    echo "   4. Verificar configurações de DNS"
    echo "   5. Contatar suporte da HostGator se necessário"
fi

echo ""
echo "📊 Verificação concluída em $(date)"
