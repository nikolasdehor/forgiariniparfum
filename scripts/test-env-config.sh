#!/bin/bash

# Script para testar a configuração de segurança
echo "🧪 Teste de Configuração de Segurança"
echo "====================================="
echo ""

# Verificar se pode carregar o .env
if php -r "
require_once 'assets/php/env_loader.php';
try {
    EnvLoader::validateRequired(['ADMIN_PASSWORD']);
    echo '✅ Arquivo .env carregado com sucesso\n';
    echo '✅ ADMIN_PASSWORD está definido\n';
    
    \$config = EnvLoader::getSecurityConfig();
    echo '✅ Configurações de segurança carregadas:\n';
    echo '   - Timeout de sessão: ' . \$config['session_timeout'] . ' segundos\n';
    echo '   - Máximo de tentativas: ' . \$config['max_login_attempts'] . '\n';
    echo '   - Ambiente: ' . \$config['environment'] . '\n';
    
} catch (Exception \$e) {
    echo '❌ Erro: ' . \$e->getMessage() . '\n';
    exit(1);
}
"; then
    echo ""
    echo "🎉 Configuração está funcionando corretamente!"
    echo ""
    echo "Para testar o login administrativo:"
    echo "1. Acesse: admin.html"
    echo "2. Use a senha configurada no arquivo .env"
    echo "3. Verifique os logs em logs/security.log"
else
    echo "❌ Erro ao carregar configurações"
    exit 1
fi
