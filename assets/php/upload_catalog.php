<?php
// Configurações
$uploadDir = '../pdf/';
$allowedExtensions = ['pdf'];
$maxFileSize = 10 * 1024 * 1024; // 10MB

// Cabeçalhos para permitir acesso via AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Resposta padrão
$response = [
    'success' => false,
    'message' => 'Nenhuma ação foi tomada.'
];

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar se um arquivo foi enviado
    if (isset($_FILES['catalog']) && $_FILES['catalog']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['catalog'];
        
        // Verificar o tamanho do arquivo
        if ($file['size'] > $maxFileSize) {
            $response['message'] = 'O arquivo é muito grande. Tamanho máximo permitido: 10MB.';
        } else {
            // Verificar a extensão do arquivo
            $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($fileExtension, $allowedExtensions)) {
                $response['message'] = 'Apenas arquivos PDF são permitidos.';
            } else {
                // Verificar e criar o diretório de upload se necessário
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Remover todos os arquivos PDF existentes no diretório
                $existingFiles = glob($uploadDir . '*.pdf');
                foreach ($existingFiles as $existingFile) {
                    if (is_file($existingFile)) {
                        unlink($existingFile);
                    }
                }
                
                // Gerar um novo nome para o arquivo
                $newFileName = 'catalogo-' . date('Ymd-His') . '.pdf';
                $uploadPath = $uploadDir . $newFileName;
                
                // Mover o arquivo para o diretório de upload
                if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                    $response['success'] = true;
                    $response['message'] = 'Catálogo enviado com sucesso!';
                    $response['file'] = [
                        'name' => $newFileName,
                        'path' => str_replace('../', '', $uploadPath),
                        'size' => filesize($uploadPath),
                        'last_modified' => filemtime($uploadPath)
                    ];
                } else {
                    $response['message'] = 'Erro ao enviar o arquivo. Tente novamente.';
                }
            }
        }
    } else {
        $response['message'] = 'Nenhum arquivo foi enviado ou ocorreu um erro no upload.';
    }
}

// Retornar a resposta como JSON
echo json_encode($response);