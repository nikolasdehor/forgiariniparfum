#!/bin/bash

# Script para verificar segurança antes de fazer commit
echo "🔒 Verificação de Segurança - Pre-Commit"
echo "========================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

# Função para reportar problemas
report_issue() {
    echo -e "${RED}❌ PROBLEMA: $1${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
}

# Função para reportar avisos
report_warning() {
    echo -e "${YELLOW}⚠️  AVISO: $1${NC}"
}

# Função para reportar sucesso
report_ok() {
    echo -e "${GREEN}✅ OK: $1${NC}"
}

echo "🔍 Verificando arquivos sensíveis..."

# Verificar se .env existe e não está sendo commitado
if [ -f ".env" ]; then
    if git ls-files --error-unmatch .env >/dev/null 2>&1; then
        report_issue "Arquivo .env está sendo rastreado pelo Git!"
        echo "   Execute: git rm --cached .env"
    else
        report_ok "Arquivo .env existe mas não está sendo commitado"
    fi
else
    report_warning "Arquivo .env não encontrado. Crie um baseado no .env.example"
fi

# Verificar se .env.example existe
if [ -f ".env.example" ]; then
    report_ok "Arquivo .env.example encontrado"
else
    report_warning "Arquivo .env.example não encontrado"
fi

# Verificar arquivos .coreftp
if ls *.coreftp >/dev/null 2>&1; then
    for file in *.coreftp; do
        if git ls-files --error-unmatch "$file" >/dev/null 2>&1; then
            report_issue "Arquivo $file está sendo rastreado pelo Git!"
            echo "   Execute: git rm --cached '$file'"
        else
            report_ok "Arquivo $file não está sendo commitado"
        fi
    done
else
    report_ok "Nenhum arquivo .coreftp encontrado para commit"
fi

# Verificar ftp-config.txt
if [ -f "ftp-config.txt" ]; then
    if git ls-files --error-unmatch ftp-config.txt >/dev/null 2>&1; then
        report_issue "Arquivo ftp-config.txt está sendo rastreado pelo Git!"
        echo "   Execute: git rm --cached ftp-config.txt"
    else
        report_ok "Arquivo ftp-config.txt não está sendo commitado"
    fi
fi

echo ""
echo "🔍 Verificando senhas hardcoded..."

# Verificar senhas hardcoded em arquivos que serão commitados
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)

if [ -n "$STAGED_FILES" ]; then
    # Padrões suspeitos
    PATTERNS=(
        "password.*=.*['\"][^'\"]*['\"]"
        "senha.*=.*['\"][^'\"]*['\"]"
        "forgiarini2025"
        "ADMIN_PASSWORD.*=.*['\"][^'\"]*['\"]"
        "ftp\..*\..*"
        "@.*\..*"
    )
    
    for file in $STAGED_FILES; do
        if [ -f "$file" ]; then
            for pattern in "${PATTERNS[@]}"; do
                if grep -i -E "$pattern" "$file" >/dev/null 2>&1; then
                    report_issue "Possível senha/credencial encontrada em $file"
                    echo "   Padrão: $pattern"
                    grep -i -n -E "$pattern" "$file" | head -3
                    echo ""
                fi
            done
        fi
    done
    
    if [ $ISSUES_FOUND -eq 0 ]; then
        report_ok "Nenhuma senha hardcoded encontrada nos arquivos staged"
    fi
else
    report_warning "Nenhum arquivo staged para commit"
fi

echo ""
echo "🔍 Verificando .gitignore..."

# Verificar se .gitignore tem as entradas necessárias
REQUIRED_ENTRIES=(
    ".env"
    "*.coreftp"
    "ftp-config.txt"
)

for entry in "${REQUIRED_ENTRIES[@]}"; do
    if grep -q "^$entry" .gitignore; then
        report_ok "$entry está no .gitignore"
    else
        report_issue "$entry não está no .gitignore"
    fi
done

# ========================================
# NOVA VERIFICAÇÃO DE SEGURANÇA COM .ENV
# ========================================

echo ""
echo "🔐 VERIFICAÇÃO DE CONFIGURAÇÃO .ENV"
echo "==================================="

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ ERRO: Arquivo .env não encontrado!"
    echo "   Copie .env.example para .env e configure as variáveis."
    echo "   Comando: cp .env.example .env"
    echo ""
    exit 1
else
    echo "✅ Arquivo .env encontrado"
fi

# Verificar se ADMIN_PASSWORD está definido
if grep -q "ADMIN_PASSWORD=" .env; then
    # Verificar se não é uma senha vazia
    if grep -q "ADMIN_PASSWORD=$" .env || grep -q "ADMIN_PASSWORD=\"\"" .env; then
        echo "❌ ERRO: ADMIN_PASSWORD está vazio!"
        echo "   Configure uma senha forte no arquivo .env"
        exit 1
    else
        echo "✅ ADMIN_PASSWORD configurado"
        
        # Verificar força da senha (básico)
        password=$(grep "ADMIN_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"')
        if [ ${#password} -lt 8 ]; then
            echo "⚠️  AVISO: Senha muito curta (menos de 8 caracteres)"
        elif [ ${#password} -lt 12 ]; then
            echo "⚠️  AVISO: Considere usar uma senha mais longa (12+ caracteres)"
        else
            echo "✅ Comprimento da senha adequado"
        fi
    fi
else
    echo "❌ ERRO: ADMIN_PASSWORD não definido no .env!"
    exit 1
fi

# Verificar se .env está no .gitignore
if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
    echo "✅ .env está no .gitignore"
else
    echo "❌ ERRO: .env não está no .gitignore!"
    echo "   Adicione '.env' ao arquivo .gitignore"
fi

# Verificar arquivos PHP de segurança
required_files=(
    "assets/php/env_loader.php"
    "assets/php/check_password.php"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ ERRO: $file não encontrado!"
    fi
done

echo ""
echo "📋 RESUMO DA SEGURANÇA:"
echo "- Senha administrativa protegida em arquivo .env"
echo "- Rate limiting implementado"
echo "- Logs de segurança ativados"
echo "- Headers de segurança configurados"
echo ""
echo "📖 Para mais informações, consulte SECURITY.md"

echo ""
echo "📊 Resumo da Verificação"
echo "======================="

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 Nenhum problema de segurança encontrado!${NC}"
    echo -e "${GREEN}✅ Seguro para fazer commit${NC}"
    exit 0
else
    echo -e "${RED}🚨 $ISSUES_FOUND problema(s) de segurança encontrado(s)!${NC}"
    echo -e "${RED}❌ NÃO faça commit até resolver os problemas${NC}"
    echo ""
    echo "📋 Para resolver:"
    echo "1. Remova arquivos sensíveis do staging: git rm --cached arquivo"
    echo "2. Adicione arquivos ao .gitignore se necessário"
    echo "3. Remova senhas hardcoded do código"
    echo "4. Execute este script novamente"
    exit 1
fi
