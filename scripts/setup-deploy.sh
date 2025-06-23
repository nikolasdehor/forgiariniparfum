#!/bin/bash

# Script para configurar o deploy automático
# Este script ajuda a escolher e configurar o workflow correto

echo "🔧 Configuração de Deploy Automático"
echo "===================================="
echo ""

# Função para perguntar sim/não
ask_yes_no() {
    while true; do
        read -p "$1 (s/n): " yn
        case $yn in
            [Ss]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor, responda s ou n.";;
        esac
    done
}

# Verificar se estamos em um repositório Git
if [ ! -d ".git" ]; then
    echo "❌ Erro: Este não é um repositório Git"
    echo "Execute 'git init' primeiro"
    exit 1
fi

echo "📋 Vamos configurar seu deploy automático!"
echo ""

# Escolher tipo de deploy
echo "Escolha o tipo de deploy:"
echo "1) Deploy Simples (Recomendado para iniciantes)"
echo "2) Deploy via SFTP (Mais seguro)"
echo "3) Deploy Avançado (Apenas arquivos modificados)"
echo ""

while true; do
    read -p "Digite sua escolha (1-3): " choice
    case $choice in
        1)
            WORKFLOW_FILE="deploy.yml"
            WORKFLOW_NAME="Deploy Simples"
            break
            ;;
        2)
            WORKFLOW_FILE="deploy-sftp.yml"
            WORKFLOW_NAME="Deploy via SFTP"
            break
            ;;
        3)
            WORKFLOW_FILE="deploy-advanced.yml"
            WORKFLOW_NAME="Deploy Avançado"
            break
            ;;
        *)
            echo "Escolha inválida. Digite 1, 2 ou 3."
            ;;
    esac
done

echo ""
echo "✅ Você escolheu: $WORKFLOW_NAME"
echo ""

# Verificar se a pasta .github/workflows existe
if [ ! -d ".github/workflows" ]; then
    echo "📁 Criando pasta .github/workflows..."
    mkdir -p .github/workflows
fi

# Ativar o workflow escolhido e desativar os outros
echo "🔧 Configurando workflows..."

# Lista de todos os workflows
WORKFLOWS=("deploy.yml" "deploy-sftp.yml" "deploy-advanced.yml")

for workflow in "${WORKFLOWS[@]}"; do
    if [ "$workflow" = "$WORKFLOW_FILE" ]; then
        # Ativar o workflow escolhido
        if [ -f ".github/workflows/$workflow" ]; then
            echo "✅ Ativando $workflow"
        else
            echo "❌ Erro: Arquivo $workflow não encontrado"
        fi
    else
        # Desativar outros workflows
        if [ -f ".github/workflows/$workflow" ]; then
            mv ".github/workflows/$workflow" ".github/workflows/$workflow.disabled"
            echo "⏸️  Desativando $workflow"
        fi
    fi
done

echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Configure os secrets no GitHub:"
echo "   - Vá para Settings > Secrets and variables > Actions"
echo "   - Adicione os seguintes secrets:"

if [ "$WORKFLOW_FILE" = "deploy-sftp.yml" ]; then
    echo "     * SFTP_SERVER (ex: sftp.seudominio.com)"
    echo "     * SFTP_USERNAME (seu usuário SFTP)"
    echo "     * SFTP_PASSWORD (sua senha SFTP)"
    echo "     * SFTP_PORT (geralmente 22)"
else
    echo "     * FTP_SERVER (ex: ftp.seudominio.com)"
    echo "     * FTP_USERNAME (seu usuário FTP)"
    echo "     * FTP_PASSWORD (sua senha FTP)"
fi

echo ""
echo "2. Faça commit e push das alterações:"
echo "   git add ."
echo "   git commit -m 'Configurar deploy automático'"
echo "   git push origin main"
echo ""
echo "3. Verifique a aba Actions no GitHub para ver o deploy"
echo ""

if ask_yes_no "Deseja fazer commit das alterações agora?"; then
    echo ""
    echo "📤 Fazendo commit..."
    git add .
    git commit -m "Configurar deploy automático - $WORKFLOW_NAME"
    
    if ask_yes_no "Deseja fazer push para o GitHub?"; then
        echo "🚀 Fazendo push..."
        git push origin main
        echo ""
        echo "✅ Deploy automático configurado!"
        echo "🌐 Verifique a aba Actions no GitHub"
    fi
else
    echo ""
    echo "ℹ️  Lembre-se de fazer commit e push quando estiver pronto:"
    echo "git add ."
    echo "git commit -m 'Configurar deploy automático'"
    echo "git push origin main"
fi

echo ""
echo "📖 Para mais detalhes, consulte o arquivo DEPLOY-SETUP.md"
echo ""
echo "🎉 Configuração concluída!"
