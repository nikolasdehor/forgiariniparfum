<?php
/**
 * Verificação de senha do painel administrativo
 * Usa as configurações do arquivo .env para maior segurança
 */

// Headers de segurança e CORS
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Tratar requisições OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir o carregador de ambiente
require_once 'env_loader.php';
require_once 'security.php';

try {
    // Carregar variáveis do arquivo .env
    EnvLoader::load();
    
    // Validar que as configurações obrigatórias existem
    EnvLoader::validateRequired(['ADMIN_PASSWORD']);
    
    // Verificar método de requisição
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }

    // Verificar rate limiting
    if (!SecurityHelper::checkRateLimit('admin_login', 5, 300)) { // 5 tentativas por 5 minutos
        throw new Exception('Muitas tentativas de login. Tente novamente em alguns minutos.');
    }

    // Obter dados JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['password'])) {
        throw new Exception('Dados inválidos');
    }

    $providedPassword = trim($input['password']);
    $correctPassword = EnvLoader::get('ADMIN_PASSWORD');

    // Verificar se a senha foi definida
    if (empty($correctPassword)) {
        throw new Exception('Configuração de senha não encontrada');
    }

    // Verificar a senha usando hash timing-safe
    $isValid = hash_equals($correctPassword, $providedPassword);

    if ($isValid) {
        // Senha correta - limpar contador de tentativas
        SecurityHelper::clearRateLimit('admin_login');
        
        // Registrar login bem-sucedido
        SecurityHelper::logSecurityEvent('admin_login_success', [
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Autenticação bem-sucedida',
            'timestamp' => date('c')
        ]);
    } else {
        // Senha incorreta - registrar tentativa
        SecurityHelper::logSecurityEvent('admin_login_failed', [
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        // Pequeno delay para prevenir ataques de força bruta
        usleep(500000); // 500ms

        echo json_encode([
            'success' => false,
            'message' => 'Senha incorreta',
            'timestamp' => date('c')
        ]);
    }

} catch (Exception $e) {
    // Log do erro (sem expor detalhes sensíveis)
    error_log("Erro na verificação de senha admin: " . $e->getMessage());
    
    // Registrar tentativa suspeita
    SecurityHelper::logSecurityEvent('admin_login_error', [
        'error' => $e->getMessage(),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);

    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'timestamp' => date('c')
    ]);
}
?>
