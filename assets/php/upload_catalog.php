<?php
// Configurações
$uploadDir = '../pdf/';
$allowedExtensions = ['pdf'];
$maxFileSize = 10 * 1024 * 1024; // 10MB
$allowedMimeTypes = ['application/pdf', 'application/x-pdf'];

// Função para validar se é realmente um PDF
function isValidPDF($filePath) {
    // Verificar assinatura do arquivo (magic bytes)
    $handle = fopen($filePath, 'rb');
    if (!$handle) return false;

    $header = fread($handle, 8);
    fclose($handle);

    // PDFs começam com %PDF-
    return strpos($header, '%PDF-') === 0;
}

// Função para sanitizar nome do arquivo
function sanitizeFileName($fileName) {
    // Remover caracteres especiais e espaços
    $fileName = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $fileName);
    // Remover múltiplos underscores
    $fileName = preg_replace('/_+/', '_', $fileName);
    // Remover underscores no início e fim
    $fileName = trim($fileName, '_');

    return $fileName;
}

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
            $fileMimeType = $file['type'];

            if (!in_array($fileExtension, $allowedExtensions)) {
                $response['message'] = 'Apenas arquivos PDF são permitidos.';
            } elseif (!in_array($fileMimeType, $allowedMimeTypes)) {
                $response['message'] = 'Tipo de arquivo inválido. Apenas PDFs são aceitos.';
            } elseif (!isValidPDF($file['tmp_name'])) {
                $response['message'] = 'O arquivo não é um PDF válido.';
            } else {
                // Verificar e criar o diretório de upload se necessário
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }

                // Preservar nome original ou usar nome padrão
                $originalName = pathinfo($file['name'], PATHINFO_FILENAME);
                $sanitizedName = sanitizeFileName($originalName);

                // Se o nome sanitizado estiver vazio, usar nome padrão
                if (empty($sanitizedName)) {
                    $sanitizedName = 'catalogo-' . date('Ymd-His');
                }

                // Adicionar timestamp para evitar conflitos e manter histórico
                $timestamp = date('Ymd-His');
                $newFileName = $sanitizedName . '_' . $timestamp . '.pdf';

                // Se ainda existir (muito improvável), adicionar contador
                $counter = 1;
                while (file_exists($uploadDir . $newFileName)) {
                    $newFileName = $sanitizedName . '_' . $timestamp . '_' . $counter . '.pdf';
                    $counter++;
                }

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