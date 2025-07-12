#!/bin/bash

echo "🔒 AUDITORIA DE SEGURANÇA COMPLETA - FORGIARINI PARFUM"
echo "=================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir status
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Contadores
security_issues=0
warnings=0

echo "1. VERIFICAÇÃO DE ARQUIVOS SENSÍVEIS"
echo "====================================="

# Verificar se .env está protegido
if [ -f ".env" ]; then
    if git check-ignore .env >/dev/null 2>&1; then
        print_status "OK" "Arquivo .env está protegido pelo .gitignore"
    else
        print_status "ERROR" "CRÍTICO: Arquivo .env NÃO está protegido!"
        security_issues=$((security_issues + 1))
    fi
else
    print_status "WARNING" "Arquivo .env não encontrado"
    warnings=$((warnings + 1))
fi

# Verificar se arquivos PHP de segurança estão sendo commitados
if git check-ignore assets/php/check_password.php >/dev/null 2>&1; then
    print_status "ERROR" "CRÍTICO: check_password.php está sendo ignorado!"
    security_issues=$((security_issues + 1))
else
    print_status "OK" "check_password.php será commitado corretamente"
fi

if git check-ignore assets/php/env_loader.php >/dev/null 2>&1; then
    print_status "ERROR" "CRÍTICO: env_loader.php está sendo ignorado!"
    security_issues=$((security_issues + 1))
else
    print_status "OK" "env_loader.php será commitado corretamente"
fi

echo ""
echo "2. VERIFICAÇÃO DE CREDENCIAIS EXPOSTAS"
echo "======================================"

# Verificar senhas hardcoded (excluindo arquivos seguros)
hardcoded_passwords=$(grep -r "ForgiariniAdmin2025\|senha.*=" --include="*.js" --include="*.html" --include="*.css" --exclude-dir=.git . 2>/dev/null | grep -v -E "(\.env|test-|SECURITY|VALIDATION)" | wc -l)

if [ "$hardcoded_passwords" -gt 0 ]; then
    print_status "ERROR" "CRÍTICO: $hardcoded_passwords senha(s) hardcoded encontrada(s)!"
    echo "Arquivos com problemas:"
    grep -r "ForgiariniAdmin2025\|senha.*=" --include="*.js" --include="*.html" --include="*.css" --exclude-dir=.git . 2>/dev/null | grep -v -E "(\.env|test-|SECURITY|VALIDATION)" | head -5
    security_issues=$((security_issues + 1))
else
    print_status "OK" "Nenhuma senha hardcoded encontrada nos arquivos principais"
fi

# Verificar outros tipos de credenciais
api_keys=$(grep -r "api[_-]key\|apikey\|secret[_-]key" --include="*.js" --include="*.html" --include="*.css" --exclude-dir=.git . 2>/dev/null | wc -l)
if [ "$api_keys" -gt 0 ]; then
    print_status "WARNING" "$api_keys possível(is) API key(s) encontrada(s)"
    warnings=$((warnings + 1))
fi

echo ""
echo "3. VERIFICAÇÃO DO GITHUB ACTIONS"
echo "================================"

# Verificar se arquivos sensíveis estão excluídos no deploy
if [ -f ".github/workflows/deploy.yml" ]; then
    if grep -q "\.env" .github/workflows/deploy.yml; then
        print_status "OK" "Arquivos .env excluídos do deploy"
    else
        print_status "WARNING" "Verificar se .env está excluído do deploy"
        warnings=$((warnings + 1))
    fi
    
    if grep -q "logs/" .github/workflows/deploy.yml; then
        print_status "OK" "Logs excluídos do deploy"
    else
        print_status "WARNING" "Logs podem não estar excluídos do deploy"
        warnings=$((warnings + 1))
    fi
    
    # Verificar se há verificação de segurança no workflow
    if grep -q "security\|password\|credential" .github/workflows/deploy.yml; then
        print_status "OK" "Verificações de segurança incluídas no workflow"
    else
        print_status "WARNING" "Nenhuma verificação de segurança no workflow"
        warnings=$((warnings + 1))
    fi
else
    print_status "INFO" "Nenhum GitHub Actions configurado"
fi

echo ""
echo "4. VERIFICAÇÃO DE HEADERS DE SEGURANÇA"
echo "======================================"

# Verificar headers de segurança no PHP
php_files_with_headers=$(grep -l "X-Frame-Options\|Content-Security-Policy\|X-Content-Type-Options" assets/php/*.php 2>/dev/null | wc -l)
if [ "$php_files_with_headers" -gt 0 ]; then
    print_status "OK" "Headers de segurança encontrados em $php_files_with_headers arquivo(s) PHP"
else
    print_status "WARNING" "Headers de segurança não encontrados nos arquivos PHP"
    warnings=$((warnings + 1))
fi

# Verificar .htaccess
if [ -f ".htaccess" ]; then
    if grep -q "X-Frame-Options\|Content-Security-Policy" .htaccess; then
        print_status "OK" "Headers de segurança configurados no .htaccess"
    else
        print_status "WARNING" "Headers de segurança não encontrados no .htaccess"
        warnings=$((warnings + 1))
    fi
else
    print_status "INFO" "Arquivo .htaccess não encontrado"
fi

echo ""
echo "5. VERIFICAÇÃO DE PERMISSÕES E ESTRUTURA"
echo "========================================"

# Verificar estrutura de diretórios
if [ -d "logs" ]; then
    print_status "OK" "Diretório de logs existe"
else
    print_status "INFO" "Diretório de logs será criado automaticamente"
fi

# Verificar arquivos PHP críticos
critical_files=("assets/php/check_password.php" "assets/php/env_loader.php" "assets/php/security.php")
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        # Verificar sintaxe PHP (se PHP estiver disponível)
        if command -v php >/dev/null 2>&1; then
            if php -l "$file" >/dev/null 2>&1; then
                print_status "OK" "Sintaxe PHP válida: $file"
            else
                print_status "ERROR" "CRÍTICO: Erro de sintaxe PHP em $file"
                security_issues=$((security_issues + 1))
            fi
        else
            print_status "INFO" "PHP não disponível para verificação de sintaxe"
        fi
    else
        print_status "ERROR" "CRÍTICO: Arquivo não encontrado: $file"
        security_issues=$((security_issues + 1))
    fi
done

echo ""
echo "6. VERIFICAÇÃO DE LOGS E AUDITORIA"
echo "=================================="

# Verificar se logs estão sendo protegidos
if git check-ignore logs/ >/dev/null 2>&1 || git check-ignore "*.log" >/dev/null 2>&1; then
    print_status "OK" "Logs estão protegidos pelo .gitignore"
else
    print_status "WARNING" "Logs podem não estar protegidos"
    warnings=$((warnings + 1))
fi

echo ""
echo "7. VERIFICAÇÃO DO SISTEMA .ENV"
echo "=============================="

# Executar validação do sistema .env
if [ -f "scripts/validate-complete-env-system.sh" ]; then
    print_status "INFO" "Executando validação do sistema .env..."
    if ./scripts/validate-complete-env-system.sh | grep -q "COMPLETAMENTE FUNCIONAL"; then
        print_status "OK" "Sistema .env está funcional"
    else
        print_status "WARNING" "Sistema .env pode ter problemas"
        warnings=$((warnings + 1))
    fi
else
    print_status "WARNING" "Script de validação .env não encontrado"
    warnings=$((warnings + 1))
fi

echo ""
echo "================================"
echo "RESUMO DA AUDITORIA DE SEGURANÇA"
echo "================================"

total_issues=$((security_issues + warnings))

if [ $security_issues -eq 0 ] && [ $warnings -eq 0 ]; then
    print_status "OK" "🎉 EXCELENTE! Nenhum problema de segurança encontrado!"
    echo ""
    echo "✅ Site está seguro para produção"
    echo "✅ Arquivos sensíveis protegidos"
    echo "✅ GitHub Actions configurado corretamente"
    echo "✅ Sistema .env implementado"
elif [ $security_issues -eq 0 ]; then
    print_status "WARNING" "⚠️  Site está RAZOAVELMENTE SEGURO com $warnings aviso(s)"
    echo ""
    echo "ℹ️  Recomendações para melhorar ainda mais a segurança:"
    echo "   - Revisar avisos mencionados acima"
    echo "   - Implementar headers de segurança adicionais"
    echo "   - Configurar monitoramento de logs"
else
    print_status "ERROR" "🚨 PROBLEMAS CRÍTICOS DE SEGURANÇA ENCONTRADOS!"
    echo ""
    echo "❌ Problemas críticos: $security_issues"
    echo "⚠️  Avisos: $warnings"
    echo ""
    echo "🔧 AÇÃO NECESSÁRIA:"
    echo "   1. Corrigir TODOS os problemas críticos antes do deploy"
    echo "   2. Revisar e corrigir avisos"
    echo "   3. Executar esta auditoria novamente"
    echo "   4. Só fazer deploy após 0 problemas críticos"
fi

echo ""
echo "📊 ESTATÍSTICAS:"
echo "   - Problemas críticos: $security_issues"
echo "   - Avisos: $warnings"
echo "   - Status geral: $([ $security_issues -eq 0 ] && echo "SEGURO" || echo "NECESSITA CORREÇÃO")"

echo ""
echo "📅 Auditoria executada em: $(date)"

# Retornar código de erro se houver problemas críticos
exit $security_issues
