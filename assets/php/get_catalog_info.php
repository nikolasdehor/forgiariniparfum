<?php
// Configurações
$pdfDir = '../pdf/';

// Cabeçalhos para permitir acesso via AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Resposta padrão
$response = [
    'success' => false,
    'message' => 'Nenhum catálogo encontrado.'
];

// Verificar se existem arquivos PDF no diretório
$pdfFiles = glob($pdfDir . '*.pdf');

if (!empty($pdfFiles)) {
    // Ordenar arquivos por data de modificação (mais recente primeiro)
    usort($pdfFiles, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    // Obter informações do arquivo mais recente
    $latestFile = $pdfFiles[0];
    $fileName = basename($latestFile);
    $fileSize = filesize($latestFile);
    $lastModified = filemtime($latestFile);
    
    $response = [
        'success' => true,
        'filename' => $fileName,
        'filesize' => $fileSize,
        'last_modified' => $lastModified,
        'file_path' => str_replace('../', '', $latestFile)
    ];
}

// Retornar a resposta como JSON
echo json_encode($response);