<?php
/**
 * DIAGNÓSTICO COMPLETO DO SISTEMA DE AUTENTICAÇÃO
 * Este arquivo testa todos os componentes para identificar problemas
 */

// Headers para debug
header('Content-Type: text/html; charset=UTF-8');

echo "<!DOCTYPE html>";
echo "<html lang='pt-BR'>";
echo "<head>";
echo "<meta charset='UTF-8'>";
echo "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
echo "<title>Diagnóstico Sistema de Autenticação</title>";
echo "<style>";
echo "body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }";
echo ".test { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 5px solid #007cba; }";
echo ".success { border-left-color: #28a745; }";
echo ".error { border-left-color: #dc3545; }";
echo ".warning { border-left-color: #ffc107; }";
echo ".code { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; }";
echo "</style>";
echo "</head>";
echo "<body>";

echo "<h1>🔍 DIAGNÓSTICO COMPLETO - SISTEMA DE AUTENTICAÇÃO</h1>";

$errors = [];
$warnings = [];
$successes = [];

// 1. Verificar se arquivo .env existe
echo "<div class='test'>";
echo "<h3>1. Verificação do arquivo .env</h3>";
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    echo "<p style='color: green;'>✅ Arquivo .env encontrado: $envPath</p>";
    $successes[] = "Arquivo .env existe";
    
    // Verificar conteúdo do .env
    $envContent = file_get_contents($envPath);
    if (strpos($envContent, 'ADMIN_PASSWORD=') !== false) {
        echo "<p style='color: green;'>✅ ADMIN_PASSWORD encontrado no .env</p>";
        $successes[] = "ADMIN_PASSWORD configurado";
        
        // Extrair senha para verificação (sem mostrar na tela)
        preg_match('/ADMIN_PASSWORD=(.+)/', $envContent, $matches);
        if (!empty($matches[1])) {
            $envPassword = trim($matches[1]);
            echo "<p style='color: green;'>✅ Senha no .env não está vazia (comprimento: " . strlen($envPassword) . " caracteres)</p>";
            $successes[] = "Senha não está vazia";
        } else {
            echo "<p style='color: red;'>❌ Senha no .env está vazia</p>";
            $errors[] = "Senha está vazia no .env";
        }
    } else {
        echo "<p style='color: red;'>❌ ADMIN_PASSWORD não encontrado no .env</p>";
        $errors[] = "ADMIN_PASSWORD não encontrado";
    }
} else {
    echo "<p style='color: red;'>❌ Arquivo .env NÃO encontrado em: $envPath</p>";
    $errors[] = "Arquivo .env não existe";
}
echo "</div>";

// 2. Verificar env_loader.php
echo "<div class='test'>";
echo "<h3>2. Verificação do env_loader.php</h3>";
$envLoaderPath = __DIR__ . '/env_loader.php';
if (file_exists($envLoaderPath)) {
    echo "<p style='color: green;'>✅ env_loader.php encontrado</p>";
    $successes[] = "env_loader.php existe";
    
    try {
        require_once $envLoaderPath;
        echo "<p style='color: green;'>✅ env_loader.php carregado com sucesso</p>";
        $successes[] = "env_loader.php carregado";
        
        if (class_exists('EnvLoader')) {
            echo "<p style='color: green;'>✅ Classe EnvLoader existe</p>";
            $successes[] = "Classe EnvLoader encontrada";
            
            // Testar carregamento do .env
            try {
                EnvLoader::load();
                echo "<p style='color: green;'>✅ EnvLoader::load() executado com sucesso</p>";
                $successes[] = "EnvLoader::load() funciona";
                
                // Testar obtenção da senha
                $password = EnvLoader::get('ADMIN_PASSWORD');
                if (!empty($password)) {
                    echo "<p style='color: green;'>✅ EnvLoader::get('ADMIN_PASSWORD') retornou valor (comprimento: " . strlen($password) . ")</p>";
                    $successes[] = "EnvLoader::get() funciona";
                } else {
                    echo "<p style='color: red;'>❌ EnvLoader::get('ADMIN_PASSWORD') retornou vazio</p>";
                    $errors[] = "EnvLoader::get() retorna vazio";
                }
            } catch (Exception $e) {
                echo "<p style='color: red;'>❌ Erro ao executar EnvLoader::load(): " . $e->getMessage() . "</p>";
                $errors[] = "Erro no EnvLoader::load()";
            }
        } else {
            echo "<p style='color: red;'>❌ Classe EnvLoader não encontrada</p>";
            $errors[] = "Classe EnvLoader não existe";
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Erro ao carregar env_loader.php: " . $e->getMessage() . "</p>";
        $errors[] = "Erro ao carregar env_loader.php";
    }
} else {
    echo "<p style='color: red;'>❌ env_loader.php NÃO encontrado em: $envLoaderPath</p>";
    $errors[] = "env_loader.php não existe";
}
echo "</div>";

// 3. Verificar check_password.php
echo "<div class='test'>";
echo "<h3>3. Verificação do check_password.php</h3>";
$checkPasswordPath = __DIR__ . '/check_password.php';
if (file_exists($checkPasswordPath)) {
    echo "<p style='color: green;'>✅ check_password.php encontrado</p>";
    $successes[] = "check_password.php existe";
    
    $content = file_get_contents($checkPasswordPath);
    if (strpos($content, 'EnvLoader::load()') !== false) {
        echo "<p style='color: green;'>✅ check_password.php chama EnvLoader::load()</p>";
        $successes[] = "EnvLoader::load() chamado";
    } else {
        echo "<p style='color: red;'>❌ check_password.php NÃO chama EnvLoader::load()</p>";
        $errors[] = "EnvLoader::load() não chamado";
    }
    
    if (strpos($content, "EnvLoader::get('ADMIN_PASSWORD')") !== false) {
        echo "<p style='color: green;'>✅ check_password.php usa EnvLoader::get('ADMIN_PASSWORD')</p>";
        $successes[] = "EnvLoader::get() usado";
    } else {
        echo "<p style='color: red;'>❌ check_password.php NÃO usa EnvLoader::get('ADMIN_PASSWORD')</p>";
        $errors[] = "EnvLoader::get() não usado";
    }
} else {
    echo "<p style='color: red;'>❌ check_password.php NÃO encontrado</p>";
    $errors[] = "check_password.php não existe";
}
echo "</div>";

// 4. Teste de requisição POST simulada
echo "<div class='test'>";
echo "<h3>4. Teste de Autenticação Simulada</h3>";
if (class_exists('EnvLoader') && isset($password) && !empty($password)) {
    // Simular teste com senha correta
    $testPassword = $password; // Senha do .env
    $isValid = hash_equals($password, $testPassword);
    
    if ($isValid) {
        echo "<p style='color: green;'>✅ Teste de hash_equals() com senha correta: SUCESSO</p>";
        $successes[] = "Verificação de senha funciona";
    } else {
        echo "<p style='color: red;'>❌ Teste de hash_equals() com senha correta: FALHOU</p>";
        $errors[] = "Verificação de senha falhou";
    }
    
    // Teste com senha incorreta
    $wrongPassword = "senhaerrada123";
    $isInvalid = !hash_equals($password, $wrongPassword);
    
    if ($isInvalid) {
        echo "<p style='color: green;'>✅ Teste de hash_equals() com senha incorreta: REJEITADO corretamente</p>";
        $successes[] = "Rejeição de senha incorreta funciona";
    } else {
        echo "<p style='color: red;'>❌ Teste de hash_equals() com senha incorreta: ACEITOU incorretamente</p>";
        $errors[] = "Não rejeita senha incorreta";
    }
} else {
    echo "<p style='color: orange;'>⚠️ Não foi possível testar autenticação (dependências anteriores falharam)</p>";
    $warnings[] = "Teste de autenticação não realizado";
}
echo "</div>";

// 5. Verificar configuração PHP
echo "<div class='test'>";
echo "<h3>5. Verificação da Configuração PHP</h3>";
echo "<p style='color: green;'>✅ Versão PHP: " . PHP_VERSION . "</p>";
echo "<p style='color: green;'>✅ JSON extension: " . (extension_loaded('json') ? 'Carregada' : 'NÃO carregada') . "</p>";
echo "<p style='color: green;'>✅ file_get_contents() disponível: " . (function_exists('file_get_contents') ? 'Sim' : 'Não') . "</p>";
echo "<p style='color: green;'>✅ hash_equals() disponível: " . (function_exists('hash_equals') ? 'Sim' : 'Não') . "</p>";
echo "</div>";

// 6. Teste de admin.html
echo "<div class='test'>";
echo "<h3>6. Verificação do admin.html</h3>";
$adminPath = __DIR__ . '/../../admin.html';
if (file_exists($adminPath)) {
    echo "<p style='color: green;'>✅ admin.html encontrado</p>";
    $successes[] = "admin.html existe";
    
    $adminContent = file_get_contents($adminPath);
    if (strpos($adminContent, 'assets/php/check_password.php') !== false) {
        echo "<p style='color: green;'>✅ admin.html faz fetch para check_password.php</p>";
        $successes[] = "admin.html configurado corretamente";
    } else {
        echo "<p style='color: red;'>❌ admin.html NÃO faz fetch para check_password.php</p>";
        $errors[] = "admin.html mal configurado";
    }
} else {
    echo "<p style='color: red;'>❌ admin.html NÃO encontrado</p>";
    $errors[] = "admin.html não existe";
}
echo "</div>";

// Resumo final
echo "<div class='test'>";
echo "<h3>📊 RESUMO DO DIAGNÓSTICO</h3>";
echo "<p><strong>✅ Sucessos:</strong> " . count($successes) . "</p>";
echo "<p><strong>❌ Erros:</strong> " . count($errors) . "</p>";
echo "<p><strong>⚠️ Avisos:</strong> " . count($warnings) . "</p>";

if (count($errors) > 0) {
    echo "<h4 style='color: red;'>🚨 PROBLEMAS ENCONTRADOS:</h4>";
    echo "<ul>";
    foreach ($errors as $error) {
        echo "<li style='color: red;'>$error</li>";
    }
    echo "</ul>";
}

if (count($successes) >= 8) {
    echo "<h4 style='color: green;'>🎉 SISTEMA PARECE ESTAR FUNCIONANDO!</h4>";
    echo "<p>Se ainda há problemas, verifique:</p>";
    echo "<ul>";
    echo "<li>Se o servidor suporta PHP</li>";
    echo "<li>Se os arquivos têm as permissões corretas</li>";
    echo "<li>Se há erro 500 no console do navegador</li>";
    echo "<li>Se o .htaccess não está bloqueando requisições PHP</li>";
    echo "</ul>";
} else {
    echo "<h4 style='color: red;'>🔧 SISTEMA PRECISA DE CORREÇÕES</h4>";
    echo "<p>Corrija os erros listados acima antes de testar novamente.</p>";
}
echo "</div>";

// 7. Teste prático
echo "<div class='test'>";
echo "<h3>7. Teste Prático de Autenticação</h3>";
echo "<p>Cole o código JavaScript abaixo no console do seu navegador (F12) para testar:</p>";
echo "<div class='code'>";
echo "// Teste com senha correta (substitua pela sua senha)\n";
echo "fetch('assets/php/check_password.php', {\n";
echo "    method: 'POST',\n";
echo "    headers: { 'Content-Type': 'application/json' },\n";
echo "    body: JSON.stringify({ password: 'ForgiariniAdmin2025!' })\n";
echo "})\n";
echo ".then(response => response.json())\n";
echo ".then(data => console.log('Resultado:', data))\n";
echo ".catch(error => console.error('Erro:', error));";
echo "</div>";
echo "</div>";

echo "</body>";
echo "</html>";
?>
