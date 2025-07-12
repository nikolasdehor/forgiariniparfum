<?php
// Script para obter o PDF mais recente da pasta
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$pdfDir = '../pdf/';
$response = ['success' => false, 'pdf_url' => ''];

try {
    if (is_dir($pdfDir)) {
        $pdfFiles = glob($pdfDir . '*.pdf');
        
        if (!empty($pdfFiles)) {
            // Ordenar por data de modificação (mais recente primeiro)
            usort($pdfFiles, function($a, $b) {
                return filemtime($b) - filemtime($a);
            });
            
            $latestPdf = basename($pdfFiles[0]);
            $response = [
                'success' => true,
                'pdf_url' => 'assets/pdf/' . $latestPdf,
                'filename' => $latestPdf,
                'total_files' => count($pdfFiles)
            ];
        }
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>
