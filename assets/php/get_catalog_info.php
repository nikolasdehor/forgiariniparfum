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
    'message' => 'Nenhum catálogo encontrado.',
    'catalogs' => []
];

// Função para obter informações detalhadas do PDF
function getPDFInfo($filePath) {
    $info = [
        'filename' => basename($filePath),
        'filesize' => filesize($filePath),
        'last_modified' => filemtime($filePath),
        'file_path' => str_replace('../', '', $filePath),
        'upload_date' => date('Y-m-d H:i:s', filemtime($filePath))
    ];

    return $info;
}

// Verificar se existem arquivos PDF no diretório
$pdfFiles = glob($pdfDir . '*.pdf');

if (!empty($pdfFiles)) {
    // Ordenar arquivos por data de modificação (mais recente primeiro)
    usort($pdfFiles, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });

    // Obter informações de todos os catálogos
    $allCatalogs = [];
    foreach ($pdfFiles as $file) {
        $allCatalogs[] = getPDFInfo($file);
    }

    // Arquivo mais recente
    $latestFile = $pdfFiles[0];
    $latestInfo = getPDFInfo($latestFile);

    $response = [
        'success' => true,
        'latest' => $latestInfo,
        'catalogs' => $allCatalogs,
        'total_count' => count($pdfFiles),
        // Manter compatibilidade com código antigo
        'filename' => $latestInfo['filename'],
        'filesize' => $latestInfo['filesize'],
        'last_modified' => $latestInfo['last_modified'],
        'file_path' => $latestInfo['file_path']
    ];
}

// Retornar a resposta como JSON
echo json_encode($response);