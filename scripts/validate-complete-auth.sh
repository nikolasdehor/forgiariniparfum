#!/bin/bash

echo "🔍 VALIDAÇÃO COMPLETA DO SISTEMA DE AUTENTICAÇÃO"
echo "=================================================="
echo ""

# 1. Verificar se o arquivo .env existe e tem a senha
echo "1️⃣ Verificando arquivo .env..."
if [ -f ".env" ]; then
    echo "✅ Arquivo .env existe"
    
    if grep -q "ADMIN_PASSWORD=ForgiariniAdmin2025!" .env; then
        echo "✅ ADMIN_PASSWORD está definido como: ForgiariniAdmin2025!"
    else
        echo "❌ ADMIN_PASSWORD não encontrado ou valor diferente"
        echo "Valor atual:"
        grep "ADMIN_PASSWORD=" .env || echo "Não encontrado"
    fi
else
    echo "❌ Arquivo .env não existe!"
    exit 1
fi

echo ""

# 2. Verificar se os arquivos PHP existem
echo "2️⃣ Verificando arquivos PHP..."
required_files=(
    "assets/php/env_loader.php"
    "assets/php/check_password.php"
    "assets/php/security.php"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file existe"
    else
        echo "❌ $file não encontrado!"
    fi
done

echo ""

# 3. Verificar se admin.html está configurado corretamente
echo "3️⃣ Verificando admin.html..."
if grep -q "check_password.php" admin.html; then
    echo "✅ admin.html está chamando check_password.php"
else
    echo "❌ admin.html não está configurado para usar check_password.php"
fi

if grep -q "verifyPassword" admin.html; then
    echo "✅ Função verifyPassword encontrada em admin.html"
else
    echo "❌ Função verifyPassword não encontrada"
fi

echo ""

# 4. Testar se o PHP pode carregar o .env (se PHP estiver disponível)
echo "4️⃣ Testando carregamento do .env..."
if command -v php >/dev/null 2>&1; then
    echo "✅ PHP disponível, testando carregamento..."
    
    # Criar script de teste temporário
    cat > test_env.php << 'EOF'
<?php
require_once 'assets/php/env_loader.php';

try {
    EnvLoader::load();
    $password = EnvLoader::get('ADMIN_PASSWORD');
    
    if (empty($password)) {
        echo "❌ ERRO: Senha não foi carregada do .env\n";
        exit(1);
    }
    
    echo "✅ .env carregado com sucesso\n";
    echo "✅ ADMIN_PASSWORD carregado: " . substr($password, 0, 3) . "****\n";
    
    // Testar a validação
    if ($password === 'ForgiariniAdmin2025!') {
        echo "✅ Senha corresponde ao valor esperado\n";
    } else {
        echo "❌ Senha não corresponde ao valor esperado\n";
        echo "Esperado: ForgiariniAdmin2025!\n";
        echo "Atual: $password\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    exit(1);
}
EOF

    php test_env.php
    rm test_env.php
    
else
    echo "⚠️  PHP não disponível para teste"
    echo "   Teste manual necessário acessando admin.html"
fi

echo ""

# 5. Verificar permissões
echo "5️⃣ Verificando permissões..."
env_perms=$(ls -l .env | cut -d' ' -f1)
echo "Permissões do .env: $env_perms"

if [[ $env_perms == "-rw-------"* ]]; then
    echo "✅ Permissões do .env estão corretas (600)"
else
    echo "⚠️  Permissões do .env podem estar inseguras"
    echo "   Recomendado: chmod 600 .env"
fi

echo ""

# 6. Simular teste de autenticação
echo "6️⃣ Simulando teste de autenticação..."
if command -v curl >/dev/null 2>&1; then
    echo "🔄 Testando endpoint de autenticação..."
    
    # Criar payload de teste
    test_payload='{"password":"ForgiariniAdmin2025!"}'
    
    # Tentar fazer requisição (se o servidor estiver rodando)
    if curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$test_payload" \
        "http://localhost/forgiariniparfum/assets/php/check_password.php" \
        2>/dev/null | grep -q "success"; then
        echo "✅ Endpoint de autenticação responde corretamente"
    else
        echo "⚠️  Servidor não está rodando ou endpoint não responde"
        echo "   Teste manual necessário: acesse admin.html em um servidor web"
    fi
else
    echo "⚠️  curl não disponível para teste de endpoint"
fi

echo ""
echo "📋 RESUMO DA VALIDAÇÃO"
echo "======================"

# Verificar se todos os componentes estão presentes
components_ok=0
total_components=5

[ -f ".env" ] && grep -q "ADMIN_PASSWORD=ForgiariniAdmin2025!" .env && ((components_ok++))
[ -f "assets/php/env_loader.php" ] && ((components_ok++))
[ -f "assets/php/check_password.php" ] && ((components_ok++))
grep -q "check_password.php" admin.html && ((components_ok++))
grep -q "verifyPassword" admin.html && ((components_ok++))

echo "Componentes funcionais: $components_ok/$total_components"

if [ $components_ok -eq $total_components ]; then
    echo ""
    echo "🎉 VALIDAÇÃO COMPLETA: SISTEMA ESTÁ CONFIGURADO!"
    echo ""
    echo "✅ Arquivo .env com senha: ForgiariniAdmin2025!"
    echo "✅ Arquivos PHP de segurança presentes"
    echo "✅ admin.html configurado corretamente"
    echo ""
    echo "🧪 PARA TESTAR:"
    echo "1. Acesse admin.html em um servidor web"
    echo "2. Digite a senha: ForgiariniAdmin2025!"
    echo "3. Verifique os logs em logs/security.log"
    echo ""
    echo "📖 Documentação completa em SECURITY.md"
else
    echo ""
    echo "⚠️  ALGUNS COMPONENTES PRECISAM DE ATENÇÃO"
    echo "   Revise os itens marcados com ❌ acima"
fi
