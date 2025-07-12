<?php
// Verificação simples de senha - FUNCIONAMENTO GARANTIDO
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Senha não fornecida']);
    exit();
}

$senha_digitada = trim($input['password']);
$senha_correta = 'ForgiariniAdmin2025!';

if ($senha_digitada === $senha_correta) {
    echo json_encode([
        'success' => true, 
        'message' => 'Login realizado com sucesso!'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Senha incorreta'
    ]);
}
?>
