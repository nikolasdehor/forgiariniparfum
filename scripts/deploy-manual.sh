#!/bin/bash

# Script para deploy manual via FTP
# Use este script se quiser fazer deploy manual sem usar GitHub Actions

echo "🚀 Deploy Manual para HostGator"
echo "================================"

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$FTP_SERVER" ] || [ -z "$FTP_USERNAME" ] || [ -z "$FTP_PASSWORD" ]; then
    echo "❌ Erro: Variáveis de ambiente não configuradas"
    echo ""
    echo "Configure as seguintes variáveis:"
    echo "export FTP_SERVER='ftp.seudominio.com'"
    echo "export FTP_USERNAME='seuusuario'"
    echo "export FTP_PASSWORD='suasenha'"
    echo ""
    exit 1
fi

# Verificar se lftp está instalado
if ! command -v lftp &> /dev/null; then
    echo "❌ Erro: lftp não está instalado"
    echo "Instale com: sudo apt-get install lftp (Ubuntu/Debian)"
    echo "ou: brew install lftp (macOS)"
    exit 1
fi

echo "📡 Conectando ao servidor: $FTP_SERVER"
echo "👤 Usuário: $FTP_USERNAME"
echo ""

# Arquivos a serem excluídos do upload
EXCLUDE_PATTERNS=(
    ".git*"
    "node_modules/"
    ".env*"
    "README.md"
    ".github/"
    "scripts/"
    "package*.json"
    "yarn.lock"
    "*.md"
    "DEPLOY-SETUP.md"
)

# Criar arquivo temporário com padrões de exclusão
EXCLUDE_FILE=$(mktemp)
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    echo "$pattern" >> "$EXCLUDE_FILE"
done

echo "📁 Sincronizando arquivos..."
echo "⏳ Isso pode levar alguns minutos..."

# Executar sincronização com lftp
lftp -c "
set ftp:ssl-allow no
set ftp:ssl-force no
set ssl:verify-certificate no
open ftp://$FTP_USERNAME:$FTP_PASSWORD@$FTP_SERVER
lcd .
cd public_html
mirror --reverse --delete --verbose --exclude-glob-from=$EXCLUDE_FILE . .
quit
"

# Limpar arquivo temporário
rm "$EXCLUDE_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Verifique seu site: https://forgiariniparfum.dehor.dev/"
else
    echo ""
    echo "❌ Erro durante o deploy"
    echo "Verifique suas credenciais e conexão"
fi
