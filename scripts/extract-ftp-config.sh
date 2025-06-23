#!/bin/bash

# Script para extrair configurações FTP do arquivo .coreftp da HostGator
# e configurar automaticamente o deploy

echo "🔧 Extrator de Configurações FTP da HostGator"
echo "============================================="
echo ""

# Procurar arquivo .coreftp
COREFTP_FILE=$(find . -name "*.coreftp" -type f | head -1)

if [ -z "$COREFTP_FILE" ]; then
    echo "❌ Erro: Arquivo .coreftp não encontrado"
    echo "Certifique-se de que o arquivo baixado da HostGator está na pasta do projeto"
    exit 1
fi

echo "📁 Arquivo encontrado: $COREFTP_FILE"
echo ""

# Extrair informações do arquivo
HOST=$(grep "^Host," "$COREFTP_FILE" | cut -d',' -f2)
USER=$(grep "^User," "$COREFTP_FILE" | cut -d',' -f2)
PORT=$(grep "^Port," "$COREFTP_FILE" | cut -d',' -f2)
NAME=$(grep "^Name," "$COREFTP_FILE" | cut -d',' -f2)

echo "📋 Configurações extraídas:"
echo "   Servidor: $HOST"
echo "   Usuário: $USER"
echo "   Porta: $PORT"
echo "   Nome: $NAME"
echo ""

# Verificar se as informações foram extraídas corretamente
if [ -z "$HOST" ] || [ -z "$USER" ] || [ -z "$PORT" ]; then
    echo "❌ Erro: Não foi possível extrair todas as informações necessárias"
    exit 1
fi

echo "✅ Informações extraídas com sucesso!"
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

echo "🔐 Configuração dos Secrets do GitHub"
echo "====================================="
echo ""
echo "Para configurar o deploy automático, você precisa adicionar estes secrets no GitHub:"
echo ""
echo "1. Vá para: Settings → Secrets and variables → Actions"
echo "2. Clique em 'New repository secret'"
echo "3. Adicione os seguintes secrets:"
echo ""
echo "   Nome: FTP_SERVER"
echo "   Valor: $HOST"
echo ""
echo "   Nome: FTP_USERNAME"
echo "   Valor: $USER"
echo ""
echo "   Nome: FTP_PASSWORD"
echo "   Valor: [SUA_SENHA_FTP]"
echo ""

# Criar arquivo de configuração local para referência
CONFIG_FILE="ftp-config.txt"
cat > "$CONFIG_FILE" << EOF
# Configurações FTP extraídas do arquivo HostGator
# Use estas informações para configurar os secrets no GitHub

FTP_SERVER=$HOST
FTP_USERNAME=$USER
FTP_PORT=$PORT
FTP_PASSWORD=[INSIRA_SUA_SENHA_AQUI]

# Para configurar no GitHub:
# 1. Vá para Settings → Secrets and variables → Actions
# 2. Adicione cada secret acima (exceto FTP_PORT, que é opcional)

# IMPORTANTE: Não commite este arquivo com a senha real!
EOF

echo "📝 Arquivo de configuração criado: $CONFIG_FILE"
echo "   (Use como referência para configurar os secrets)"
echo ""

if ask_yes_no "Deseja executar o script de configuração de deploy agora?"; then
    echo ""
    echo "🚀 Executando configuração de deploy..."

    if [ -f "scripts/setup-deploy.sh" ]; then
        chmod +x scripts/setup-deploy.sh
        ./scripts/setup-deploy.sh
    else
        echo "❌ Erro: Script setup-deploy.sh não encontrado"
    fi
else
    echo ""
    echo "ℹ️  Para configurar o deploy mais tarde, execute:"
    echo "   chmod +x scripts/setup-deploy.sh"
    echo "   ./scripts/setup-deploy.sh"
fi

echo ""
echo "📖 Próximos passos:"
echo "1. Configure os secrets no GitHub usando as informações acima"
echo "2. Execute o script de configuração de deploy"
echo "3. Faça commit e push para testar"
echo ""
echo "🎉 Configuração concluída!"