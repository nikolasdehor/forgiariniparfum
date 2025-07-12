<?php
/**
 * Sistema de Segurança Avançado para Forgiarini Parfum
 * Integrado com configurações do arquivo .env
 */

// Incluir carregador de ambiente
require_once 'env_loader.php';

class SecurityHelper {
    private static $logFile = null;

    /**
     * Inicializa o sistema de segurança
     */
    public static function init() {
        // Carregar variáveis do arquivo .env
        EnvLoader::load();
        
        // Definir arquivo de log baseado no ambiente
        $environment = EnvLoader::get('ENVIRONMENT', 'production');
        if ($environment === 'development') {
            self::$logFile = __DIR__ . '/../../logs/security_dev.log';
        } else {
            self::$logFile = __DIR__ . '/../../logs/security.log';
        }

        // Criar diretório de logs se não existir
        $logDir = dirname(self::$logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0750, true);
        }

        // Configurar headers de segurança
        self::setSecurityHeaders();
    }

    /**
     * Define headers de segurança
     */
    public static function setSecurityHeaders() {
        if (!headers_sent()) {
            header('X-Content-Type-Options: nosniff');
            header('X-Frame-Options: DENY');
            header('X-XSS-Protection: 1; mode=block');
            header('Referrer-Policy: strict-origin-when-cross-origin');
            
            // Content Security Policy
            $csp = "default-src 'self'; " .
                   "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " .
                   "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " .
                   "font-src 'self' https://fonts.gstatic.com; " .
                   "img-src 'self' data: https:; " .
                   "connect-src 'self'";
            
            header("Content-Security-Policy: $csp");
        }
    }

    /**
     * Valida e sanitiza entrada de arquivos
     */
    public static function validateFileUpload($file, $allowedTypes = ['application/pdf'], $maxSize = 10485760) {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Erro no upload do arquivo');
        }

        // Verificar tamanho do arquivo (padrão: 10MB)
        if ($file['size'] > $maxSize) {
            throw new Exception('Arquivo muito grande. Tamanho máximo: ' . round($maxSize / 1048576, 1) . 'MB');
        }

        // Verificar tipo MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($detectedType, $allowedTypes)) {
            throw new Exception('Tipo de arquivo não permitido');
        }

        // Verificar extensão do arquivo
        $allowedExtensions = [];
        foreach ($allowedTypes as $type) {
            switch ($type) {
                case 'application/pdf':
                    $allowedExtensions[] = 'pdf';
                    break;
                case 'image/jpeg':
                    $allowedExtensions[] = 'jpg';
                    $allowedExtensions[] = 'jpeg';
                    break;
                case 'image/png':
                    $allowedExtensions[] = 'png';
                    break;
            }
        }

        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, $allowedExtensions)) {
            throw new Exception('Extensão de arquivo não permitida');
        }

        return true;
    }

    /**
     * Gera nome de arquivo seguro
     */
    public static function generateSecureFilename($originalName, $prefix = '') {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $basename = pathinfo($originalName, PATHINFO_FILENAME);
        
        // Sanitizar nome base
        $basename = preg_replace('/[^a-zA-Z0-9-_]/', '-', $basename);
        $basename = trim($basename, '-');
        
        // Adicionar timestamp para unicidade
        $timestamp = date('Ymd-His');
        
        return $prefix . $basename . '-' . $timestamp . '.' . $extension;
    }

    /**
     * Implementa rate limiting usando configurações do .env
     */
    public static function checkRateLimit($action, $maxAttempts = null, $timeWindow = null) {
        if ($maxAttempts === null) {
            $maxAttempts = (int) EnvLoader::get('MAX_LOGIN_ATTEMPTS', 3);
        }
        if ($timeWindow === null) {
            $timeWindow = (int) EnvLoader::get('SESSION_TIMEOUT', 300);
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = md5($action . $ip);
        $filePath = sys_get_temp_dir() . '/forgiarini_rate_' . $key;

        // Verificar se arquivo existe e está dentro da janela de tempo
        if (file_exists($filePath)) {
            $data = json_decode(file_get_contents($filePath), true);
            if ($data && isset($data['count'], $data['first_attempt'])) {
                $timeElapsed = time() - $data['first_attempt'];
                
                if ($timeElapsed < $timeWindow) {
                    if ($data['count'] >= $maxAttempts) {
                        return false; // Rate limit excedido
                    }
                    
                    // Incrementar contador
                    $data['count']++;
                    file_put_contents($filePath, json_encode($data));
                } else {
                    // Janela de tempo expirou, resetar
                    $newData = ['count' => 1, 'first_attempt' => time()];
                    file_put_contents($filePath, json_encode($newData));
                }
            }
        } else {
            // Primeira tentativa
            $newData = ['count' => 1, 'first_attempt' => time()];
            file_put_contents($filePath, json_encode($newData));
        }

        return true;
    }

    /**
     * Limpa rate limit para um IP/ação específica
     */
    public static function clearRateLimit($action) {
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $key = md5($action . $ip);
        $filePath = sys_get_temp_dir() . '/forgiarini_rate_' . $key;

        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    /**
     * Registra eventos de segurança
     */
    public static function logSecurityEvent($event, $data = []) {
        if (!self::$logFile) {
            self::init();
        }

        $logEntry = [
            'timestamp' => date('c'),
            'event' => $event,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'data' => $data
        ];

        $logLine = json_encode($logEntry) . "\n";
        
        // Escrever no arquivo de log
        file_put_contents(self::$logFile, $logLine, FILE_APPEND | LOCK_EX);

        // Em ambiente de desenvolvimento, também registrar no log do PHP
        if (EnvLoader::get('ENVIRONMENT') === 'development') {
            error_log("SECURITY: $event - " . json_encode($data));
        }
    }

    /**
     * Verifica se o IP está em uma lista de bloqueio
     */
    public static function isBlacklisted($ip = null) {
        if ($ip === null) {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }

        // Lista básica de IPs suspeitos (pode ser expandida)
        $blacklist = [
            // IPs de exemplo - adicione IPs reais conforme necessário
        ];

        return in_array($ip, $blacklist);
    }

    /**
     * Sanitiza entrada de string
     */
    public static function sanitizeString($input, $maxLength = 255) {
        $cleaned = trim($input);
        $cleaned = strip_tags($cleaned);
        $cleaned = htmlspecialchars($cleaned, ENT_QUOTES, 'UTF-8');
        
        if ($maxLength > 0) {
            $cleaned = substr($cleaned, 0, $maxLength);
        }
        
        return $cleaned;
    }

    /**
     * Valida token CSRF (para implementação futura)
     */
    public static function validateCSRFToken($token) {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }
        
        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Gera token CSRF
     */
    public static function generateCSRFToken() {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
        
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }
}

// Inicializar automaticamente quando o arquivo for incluído
SecurityHelper::init();

?>
        
        // Inicializar contador para IP se não existir
        if (!isset($rateLimitData['requests'][$ip])) {
            $rateLimitData['requests'][$ip] = [];
        }
        
        // Adicionar request atual
        $rateLimitData['requests'][$ip][] = $currentTime;
        
        // Contar requests na janela de tempo
        $recentRequests = array_filter(
            $rateLimitData['requests'][$ip],
            function($timestamp) use ($currentTime) {
                return ($currentTime - $timestamp) <= $this->timeWindow;
            }
        );
        
        $rateLimitData['requests'][$ip] = array_values($recentRequests);
        
        // Verificar se excedeu o limite
        if (count($recentRequests) > $this->maxRequests) {
            $rateLimitData['blocked'][$ip] = $currentTime + $this->blockDuration;
            $this->logSecurityEvent('rate_limit_exceeded', $ip, 'IP bloqueado por excesso de requests');
            $this->saveRateLimitData($rateLimitData);
            return false;
        }
        
        $this->saveRateLimitData($rateLimitData);
        return true;
    }
    
    // Carregar dados de rate limiting
    private function loadRateLimitData() {
        if (file_exists($this->rateLimitFile)) {
            $data = json_decode(file_get_contents($this->rateLimitFile), true);
            return $data ?: ['requests' => [], 'blocked' => []];
        }
        return ['requests' => [], 'blocked' => []];
    }
    
    // Salvar dados de rate limiting
    private function saveRateLimitData($data) {
        file_put_contents($this->rateLimitFile, json_encode($data, JSON_PRETTY_PRINT));
    }
    
    // Limpar dados antigos
    private function cleanOldRateLimitData(&$data, $currentTime) {
        // Limpar requests antigos
        foreach ($data['requests'] as $ip => $requests) {
            $data['requests'][$ip] = array_filter($requests, function($timestamp) use ($currentTime) {
                return ($currentTime - $timestamp) <= $this->timeWindow;
            });
            
            if (empty($data['requests'][$ip])) {
                unset($data['requests'][$ip]);
            }
        }
        
        // Limpar bloqueios expirados
        foreach ($data['blocked'] as $ip => $blockTime) {
            if ($blockTime <= $currentTime) {
                unset($data['blocked'][$ip]);
            }
        }
    }
    
    // Validar entrada de dados
    public function validateInput($data, $type = 'general') {
        $threats = [];
        
        switch ($type) {
            case 'filename':
                // Validar nome de arquivo
                if (preg_match('/[<>:"/\\|?*]/', $data)) {
                    $threats[] = 'invalid_filename_chars';
                }
                if (preg_match('/\.(php|exe|bat|cmd|sh|pif|scr|vbs|js)$/i', $data)) {
                    $threats[] = 'dangerous_file_extension';
                }
                break;
                
            case 'general':
            default:
                // Verificar SQL Injection
                if (preg_match('/(union|select|insert|delete|update|drop|create|alter|exec)/i', $data)) {
                    $threats[] = 'sql_injection_attempt';
                }
                
                // Verificar XSS
                if (preg_match('/<script|javascript:|on\w+\s*=/i', $data)) {
                    $threats[] = 'xss_attempt';
                }
                
                // Verificar Path Traversal
                if (preg_match('/\.\.[\/\\]/', $data)) {
                    $threats[] = 'path_traversal_attempt';
                }
                break;
        }
        
        if (!empty($threats)) {
            $this->logSecurityEvent('input_validation_failed', $this->getClientIP(), 
                'Threats detected: ' . implode(', ', $threats) . ' in data: ' . substr($data, 0, 100));
            return false;
        }
        
        return true;
    }
    
    // Verificar headers suspeitos
    public function checkSuspiciousHeaders() {
        $suspiciousHeaders = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'HTTP_CLIENT_IP'
        ];
        
        $threats = [];
        
        foreach ($suspiciousHeaders as $header) {
            if (isset($_SERVER[$header])) {
                $value = $_SERVER[$header];
                if (preg_match('/[<>"\']/', $value)) {
                    $threats[] = "suspicious_header_{$header}";
                }
            }
        }
        
        // Verificar User Agent
        if (isset($_SERVER['HTTP_USER_AGENT'])) {
            $userAgent = $_SERVER['HTTP_USER_AGENT'];
            $suspiciousAgents = [
                'sqlmap', 'nikto', 'nessus', 'openvas', 'nmap',
                'masscan', 'zap', 'burp', 'w3af', 'skipfish'
            ];
            
            foreach ($suspiciousAgents as $agent) {
                if (stripos($userAgent, $agent) !== false) {
                    $threats[] = 'suspicious_user_agent';
                    break;
                }
            }
        }
        
        if (!empty($threats)) {
            $this->logSecurityEvent('suspicious_headers', $this->getClientIP(), 
                'Threats: ' . implode(', ', $threats));
            return false;
        }
        
        return true;
    }
    
    // Obter IP real do cliente
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    // Log de eventos de segurança
    public function logSecurityEvent($type, $ip, $details = '') {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'type' => $type,
            'ip' => $ip,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
            'details' => $details
        ];
        
        $logLine = json_encode($logEntry) . "\n";
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    // Verificar se IP está em lista negra
    public function isBlacklisted($ip = null) {
        if ($ip === null) {
            $ip = $this->getClientIP();
        }
        
        // Lista de IPs conhecidamente maliciosos (exemplo)
        $blacklist = [
            // Adicione IPs maliciosos conhecidos aqui
        ];
        
        return in_array($ip, $blacklist);
    }
    
    // Gerar token CSRF
    public function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }
    
    // Verificar token CSRF
    public function verifyCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    // Sanitizar entrada
    public function sanitizeInput($input, $type = 'string') {
        switch ($type) {
            case 'filename':
                // Sanitizar nome de arquivo
                $input = preg_replace('/[^a-zA-Z0-9._-]/', '_', $input);
                $input = preg_replace('/_{2,}/', '_', $input);
                return trim($input, '_');
                
            case 'email':
                return filter_var($input, FILTER_SANITIZE_EMAIL);
                
            case 'url':
                return filter_var($input, FILTER_SANITIZE_URL);
                
            case 'int':
                return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
                
            case 'string':
            default:
                return htmlspecialchars(strip_tags($input), ENT_QUOTES, 'UTF-8');
        }
    }
    
    // Verificação completa de segurança
    public function performSecurityCheck() {
        $ip = $this->getClientIP();
        
        // Verificar rate limiting
        if (!$this->checkRateLimit($ip)) {
            http_response_code(429);
            header('Retry-After: ' . $this->blockDuration);
            die(json_encode(['error' => 'Rate limit exceeded']));
        }
        
        // Verificar lista negra
        if ($this->isBlacklisted($ip)) {
            $this->logSecurityEvent('blacklisted_access', $ip, 'Blocked blacklisted IP');
            http_response_code(403);
            die(json_encode(['error' => 'Access denied']));
        }
        
        // Verificar headers suspeitos
        if (!$this->checkSuspiciousHeaders()) {
            http_response_code(400);
            die(json_encode(['error' => 'Suspicious request']));
        }
        
        return true;
    }
}

// Função de conveniência para uso global
function initSecurity() {
    $security = new SecurityManager();
    $security->performSecurityCheck();
    return $security;
}
?>
