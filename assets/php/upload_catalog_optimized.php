<?php
// Upload de catálogo - VERSÃO OTIMIZADA: mantém apenas o mais recente
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$uploadDir = '../pdf/';
$maxFileSize = 10 * 1024 * 1024; // 10MB

// Função para limpar PDFs antigos
function cleanOldPDFs($directory) {
    $deleted = [];
    if (is_dir($directory)) {
        $files = glob($directory . '*.pdf');
        foreach ($files as $file) {
            if (unlink($file)) {
                $deleted[] = basename($file);
            }
        }
    }
    return $deleted;
}

// Função para validar PDF
function isValidPDF($filePath) {
    $handle = fopen($filePath, 'rb');
    if (!$handle) return false;
    $header = fread($handle, 8);
    fclose($handle);
    return strpos($header, '%PDF-') === 0;
}

$response = ['success' => false, 'message' => 'Erro desconhecido'];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['catalog'])) {
    $file = $_FILES['catalog'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $response['message'] = 'Erro no upload do arquivo';
    } elseif ($file['size'] > $maxFileSize) {
        $response['message'] = 'Arquivo muito grande (máx 10MB)';
    } elseif (strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) !== 'pdf') {
        $response['message'] = 'Apenas arquivos PDF são permitidos';
    } elseif (!isValidPDF($file['tmp_name'])) {
        $response['message'] = 'Arquivo não é um PDF válido';
    } else {
        // Criar diretório se não existir
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // LIMPAR PDFs antigos ANTES de fazer upload
        $deletedFiles = cleanOldPDFs($uploadDir);
        
        // Nome do novo arquivo
        $newFileName = 'catalogo-' . date('Ymd-His') . '.pdf';
        $uploadPath = $uploadDir . $newFileName;
        
        if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
            $response = [
                'success' => true,
                'message' => 'Catálogo atualizado com sucesso!',
                'new_file' => $newFileName,
                'deleted_files' => $deletedFiles,
                'file_path' => 'assets/pdf/' . $newFileName
            ];
        } else {
            $response['message'] = 'Erro ao salvar arquivo no servidor';
        }
    }
} else {
    $response['message'] = 'Nenhum arquivo foi enviado';
}

echo json_encode($response);
?>
