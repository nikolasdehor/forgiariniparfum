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
