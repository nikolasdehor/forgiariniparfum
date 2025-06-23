<?php
// Sistema de Segurança Avançado para Forgiarini Parfum
// ====================================================

class SecurityManager {
    private $logFile;
    private $rateLimitFile;
    private $maxRequests;
    private $timeWindow;
    private $blockDuration;
    
    public function __construct() {
        $this->logFile = __DIR__ . '/../../logs/security.log';
        $this->rateLimitFile = __DIR__ . '/../../logs/rate_limit.json';
        $this->maxRequests = 100; // Máximo de requests por IP
        $this->timeWindow = 3600; // Janela de tempo em segundos (1 hora)
        $this->blockDuration = 7200; // Duração do bloqueio em segundos (2 horas)
        
        $this->ensureLogDirectory();
    }
    
    // Garantir que o diretório de logs existe
    private function ensureLogDirectory() {
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    // Rate Limiting
    public function checkRateLimit($ip = null) {
        if ($ip === null) {
            $ip = $this->getClientIP();
        }
        
        $rateLimitData = $this->loadRateLimitData();
        $currentTime = time();
        
        // Limpar dados antigos
        $this->cleanOldRateLimitData($rateLimitData, $currentTime);
        
        // Verificar se IP está bloqueado
        if (isset($rateLimitData['blocked'][$ip])) {
            if ($rateLimitData['blocked'][$ip] > $currentTime) {
                $this->logSecurityEvent('rate_limit_blocked', $ip, 'IP ainda bloqueado');
                return false;
            } else {
                // Remover bloqueio expirado
                unset($rateLimitData['blocked'][$ip]);
            }
        }
        
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
