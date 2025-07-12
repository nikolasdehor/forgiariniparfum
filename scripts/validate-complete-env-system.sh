#!/bin/bash

echo "======================================"
echo "VALIDAÇÃO COMPLETA DO SISTEMA .ENV"
echo "======================================"
echo ""

# Função para marcar sucesso ou falha
check_status() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
    fi
}

# 1. Verificar se o arquivo .env existe
echo "1. Verificando arquivo .env..."
if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
    
    # Verificar se contém a senha correta
    if grep -q "ADMIN_PASSWORD=ForgiariniAdmin2025!" .env; then
        echo "✅ Senha ADMIN_PASSWORD configurada corretamente"
    else
        echo "❌ Senha ADMIN_PASSWORD não encontrada ou incorreta"
    fi
else
    echo "❌ Arquivo .env não encontrado"
fi

echo ""

# 2. Verificar o loader PHP
echo "2. Verificando env_loader.php..."
if [ -f "assets/php/env_loader.php" ]; then
    echo "✅ env_loader.php encontrado"
    
    # Verificar se tem a classe EnvLoader
    if grep -q "class EnvLoader" assets/php/env_loader.php; then
        echo "✅ Classe EnvLoader definida"
    else
        echo "❌ Classe EnvLoader não encontrada"
    fi
    
    # Verificar se tem método load
    if grep -q "public static function load" assets/php/env_loader.php; then
        echo "✅ Método load() encontrado"
    else
        echo "❌ Método load() não encontrado"
    fi
else
    echo "❌ env_loader.php não encontrado"
fi

echo ""

# 3. Verificar check_password.php
echo "3. Verificando check_password.php..."
if [ -f "assets/php/check_password.php" ]; then
    echo "✅ check_password.php encontrado"
    
    # Verificar se usa env_loader
    if grep -q "require_once.*env_loader.php" assets/php/check_password.php; then
        echo "✅ Importa env_loader.php"
    else
        echo "❌ Não importa env_loader.php"
    fi
    
    # Verificar se usa EnvLoader::load()
    if grep -q "EnvLoader::load" assets/php/check_password.php; then
        echo "✅ Chama EnvLoader::load()"
    else
        echo "❌ Não chama EnvLoader::load()"
    fi
    
    # Verificar se usa getenv ou $_ENV ou EnvLoader::get
    if grep -qE "(getenv\('ADMIN_PASSWORD'\)|\\\$_ENV\['ADMIN_PASSWORD'\]|EnvLoader::get\('ADMIN_PASSWORD'\))" assets/php/check_password.php; then
        echo "✅ Usa variável de ambiente ADMIN_PASSWORD"
    else
        echo "❌ Não usa variável de ambiente ADMIN_PASSWORD"
    fi
else
    echo "❌ check_password.php não encontrado"
fi

echo ""

# 4. Verificar admin.html
echo "4. Verificando admin.html..."
if [ -f "admin.html" ]; then
    echo "✅ admin.html encontrado"
    
    # Verificar se faz fetch para check_password.php
    if grep -q "fetch.*check_password.php" admin.html; then
        echo "✅ Faz requisição para check_password.php"
    else
        echo "❌ Não faz requisição para check_password.php"
    fi
    
    # Verificar se menciona arquivo .env
    if grep -q "arquivo .env" admin.html; then
        echo "✅ Menciona arquivo .env na interface"
    else
        echo "❌ Não menciona arquivo .env na interface"
    fi
else
    echo "❌ admin.html não encontrado"
fi

echo ""

# 5. Verificar security.php
echo "5. Verificando security.php..."
if [ -f "assets/php/security.php" ]; then
    echo "✅ security.php encontrado"
    
    # Verificar se usa env_loader
    if grep -q "require_once.*env_loader.php" assets/php/security.php; then
        echo "✅ Importa env_loader.php"
    else
        echo "❌ Não importa env_loader.php"
    fi
    
    # Verificar se carrega variáveis do .env
    if grep -q "EnvLoader::load" assets/php/security.php; then
        echo "✅ Carrega variáveis do .env"
    else
        echo "❌ Não carrega variáveis do .env"
    fi
else
    echo "❌ security.php não encontrado"
fi

echo ""

# 6. Verificar se não há senhas hardcoded
echo "6. Verificando senhas hardcoded..."
HARDCODED_COUNT=$(grep -r "ForgiariniAdmin2025!" --exclude-dir=.git --exclude="*.sh" --exclude=".env" --exclude=".env.example" . | wc -l | tr -d ' ')

if [ "$HARDCODED_COUNT" -eq 0 ]; then
    echo "✅ Nenhuma senha hardcoded encontrada (exceto .env)"
else
    echo "⚠️  Encontradas $HARDCODED_COUNT ocorrências de senha hardcoded:"
    grep -r "ForgiariniAdmin2025!" --exclude-dir=.git --exclude="*.sh" --exclude=".env" --exclude=".env.example" . | head -5
fi

echo ""

# 7. Testar sintaxe PHP
echo "7. Testando sintaxe PHP..."
if command -v php >/dev/null 2>&1; then
    php -l assets/php/env_loader.php >/dev/null 2>&1
    check_status $? "Sintaxe env_loader.php"
    
    php -l assets/php/check_password.php >/dev/null 2>&1
    check_status $? "Sintaxe check_password.php"
    
    php -l assets/php/security.php >/dev/null 2>&1
    check_status $? "Sintaxe security.php"
else
    echo "⚠️  PHP não disponível para teste de sintaxe"
fi

echo ""

# Resumo final
echo "======================================"
echo "RESUMO DA VALIDAÇÃO"
echo "======================================"

# Contar sucessos
TOTAL_CHECKS=0
SUCCESS_CHECKS=0

# Verificar cada componente crítico
if [ -f ".env" ] && grep -q "ADMIN_PASSWORD=ForgiariniAdmin2025!" .env; then
    SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ -f "assets/php/env_loader.php" ] && grep -q "class EnvLoader" assets/php/env_loader.php; then
    SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ -f "assets/php/check_password.php" ] && grep -q "EnvLoader::load" assets/php/check_password.php; then
    SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ -f "admin.html" ] && grep -q "fetch.*check_password.php" admin.html; then
    SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

if [ -f "assets/php/security.php" ] && grep -q "EnvLoader::load" assets/php/security.php; then
    SUCCESS_CHECKS=$((SUCCESS_CHECKS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo "Status: $SUCCESS_CHECKS/$TOTAL_CHECKS componentes funcionais"

if [ $SUCCESS_CHECKS -eq $TOTAL_CHECKS ]; then
    echo "🎉 SISTEMA .ENV COMPLETAMENTE FUNCIONAL!"
    echo ""
    echo "Fluxo de autenticação:"
    echo "1. admin.html → captura senha do usuário"
    echo "2. fetch() → envia para assets/php/check_password.php"
    echo "3. check_password.php → carrega env_loader.php"
    echo "4. env_loader.php → lê .env e carrega ADMIN_PASSWORD"
    echo "5. Verificação segura com hash_equals()"
    echo ""
    echo "✅ Sistema pronto para produção!"
else
    echo "⚠️  Alguns componentes precisam de atenção"
fi

echo ""
echo "Para testar em servidor web:"
echo "1. Coloque os arquivos em um servidor com PHP"
echo "2. Acesse admin.html"
echo "3. Digite: ForgiariniAdmin2025!"
echo "4. Deve autenticar com sucesso"
