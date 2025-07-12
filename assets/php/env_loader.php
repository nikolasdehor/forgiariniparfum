<?php
/**
 * Carregador de variáveis de ambiente para Forgiarini Parfum
 * Este arquivo carrega as configurações do arquivo .env de forma segura
 */

class EnvLoader {
    private static $loaded = false;
    private static $variables = [];

    /**
     * Carrega as variáveis do arquivo .env
     */
    public static function load($path = null) {
        if (self::$loaded) {
            return;
        }

        if ($path === null) {
            $path = __DIR__ . '/../../.env';
        }

        if (!file_exists($path)) {
            throw new Exception("Arquivo .env não encontrado em: " . $path);
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Ignorar comentários
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Processar linha no formato CHAVE=VALOR
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Remover aspas se existirem
                if (preg_match('/^(["\'])(.*)\\1$/', $value, $matches)) {
                    $value = $matches[2];
                }

                self::$variables[$key] = $value;
                
                // Definir também como variável de ambiente do sistema
                if (!getenv($key)) {
                    putenv("$key=$value");
                }
            }
        }

        self::$loaded = true;
    }

    /**
     * Obtém uma variável de ambiente
     */
    public static function get($key, $default = null) {
        if (!self::$loaded) {
            self::load();
        }

        // Primeiro tenta pegar da nossa cache
        if (array_key_exists($key, self::$variables)) {
            return self::$variables[$key];
        }

        // Depois tenta pegar do ambiente do sistema
        $value = getenv($key);
        if ($value !== false) {
            return $value;
        }

        // Por último, retorna o valor padrão
        return $default;
    }

    /**
     * Verifica se uma variável existe
     */
    public static function has($key) {
        if (!self::$loaded) {
            self::load();
        }

        return array_key_exists($key, self::$variables) || getenv($key) !== false;
    }

    /**
     * Obtém todas as variáveis carregadas (sem valores sensíveis)
     */
    public static function getAllKeys() {
        if (!self::$loaded) {
            self::load();
        }

        return array_keys(self::$variables);
    }

    /**
     * Valida se as variáveis obrigatórias estão definidas
     */
    public static function validateRequired($requiredKeys) {
        if (!self::$loaded) {
            self::load();
        }

        $missing = [];
        foreach ($requiredKeys as $key) {
            if (!self::has($key)) {
                $missing[] = $key;
            }
        }

        if (!empty($missing)) {
            throw new Exception("Variáveis obrigatórias não definidas no .env: " . implode(', ', $missing));
        }
    }

    /**
     * Obtém configurações de segurança
     */
    public static function getSecurityConfig() {
        return [
            'admin_password' => self::get('ADMIN_PASSWORD'),
            'session_timeout' => (int) self::get('SESSION_TIMEOUT', 3600),
            'max_login_attempts' => (int) self::get('MAX_LOGIN_ATTEMPTS', 3),
            'environment' => self::get('ENVIRONMENT', 'production')
        ];
    }
}

// Carregar automaticamente as variáveis quando o arquivo for incluído
try {
    EnvLoader::load();
} catch (Exception $e) {
    // Em desenvolvimento, mostrar o erro
    if (EnvLoader::get('ENVIRONMENT', 'production') === 'development') {
        error_log("Erro ao carregar .env: " . $e->getMessage());
    }
}

?>
