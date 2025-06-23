<?php
// Gerador automático de sitemap.xml
// Este script gera um sitemap dinâmico incluindo todos os PDFs disponíveis

header('Content-Type: application/xml; charset=utf-8');

$baseUrl = 'https://forgiariniparfum.dehor.dev';
$pdfDir = '../pdf/';

// Função para obter a data de modificação no formato ISO 8601
function getLastModified($filePath) {
    if (file_exists($filePath)) {
        return date('c', filemtime($filePath));
    }
    return date('c');
}

// Função para escapar caracteres especiais XML
function xmlEscape($string) {
    return htmlspecialchars($string, ENT_XML1, 'UTF-8');
}

// Início do XML
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"' . "\n";
echo '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

// Página principal
echo "    <url>\n";
echo "        <loc>{$baseUrl}/</loc>\n";
echo "        <lastmod>" . getLastModified('../../index.html') . "</lastmod>\n";
echo "        <changefreq>weekly</changefreq>\n";
echo "        <priority>1.0</priority>\n";

// Adicionar imagens da página principal
$images = [
    'assets/images/hero-background.jpg' => 'Forgiarini Parfum - Fragrâncias Premium',
    'assets/images/signature-perfume.jpg' => 'Sexy By Forgiarini - Perfume Autoral',
    'assets/images/perfume-laboratory.jpg' => 'Laboratório de Criação de Perfumes',
    'assets/images/preços.jpg' => 'Tabela de Preços - Perfumes Forgiarini'
];

foreach ($images as $imagePath => $imageTitle) {
    if (file_exists('../../' . $imagePath)) {
        echo "        <image:image>\n";
        echo "            <image:loc>{$baseUrl}/{$imagePath}</image:loc>\n";
        echo "            <image:title>" . xmlEscape($imageTitle) . "</image:title>\n";
        echo "        </image:image>\n";
    }
}

echo "    </url>\n";

// Seções da página principal
$sections = [
    '#sobre' => ['changefreq' => 'monthly', 'priority' => '0.7'],
    '#perfume-autoral' => ['changefreq' => 'monthly', 'priority' => '0.8'],
    '#precos' => ['changefreq' => 'weekly', 'priority' => '0.9'],
    '#contato' => ['changefreq' => 'monthly', 'priority' => '0.6']
];

foreach ($sections as $section => $config) {
    echo "    <url>\n";
    echo "        <loc>{$baseUrl}/{$section}</loc>\n";
    echo "        <lastmod>" . getLastModified('../../index.html') . "</lastmod>\n";
    echo "        <changefreq>{$config['changefreq']}</changefreq>\n";
    echo "        <priority>{$config['priority']}</priority>\n";
    echo "    </url>\n";
}

// Adicionar PDFs dinamicamente
if (is_dir($pdfDir)) {
    $pdfFiles = glob($pdfDir . '*.pdf');
    
    if (!empty($pdfFiles)) {
        // Ordenar por data de modificação (mais recente primeiro)
        usort($pdfFiles, function($a, $b) {
            return filemtime($b) - filemtime($a);
        });
        
        foreach ($pdfFiles as $pdfFile) {
            $fileName = basename($pdfFile);
            $relativePath = 'assets/pdf/' . $fileName;
            $lastMod = getLastModified($pdfFile);
            
            // Determinar prioridade baseada na idade do arquivo
            $fileAge = time() - filemtime($pdfFile);
            $daysSinceModified = $fileAge / (24 * 60 * 60);
            
            if ($daysSinceModified < 7) {
                $priority = '0.9'; // Arquivo muito recente
                $changefreq = 'daily';
            } elseif ($daysSinceModified < 30) {
                $priority = '0.8'; // Arquivo recente
                $changefreq = 'weekly';
            } else {
                $priority = '0.6'; // Arquivo antigo
                $changefreq = 'monthly';
            }
            
            echo "    <url>\n";
            echo "        <loc>{$baseUrl}/{$relativePath}</loc>\n";
            echo "        <lastmod>{$lastMod}</lastmod>\n";
            echo "        <changefreq>{$changefreq}</changefreq>\n";
            echo "        <priority>{$priority}</priority>\n";
            echo "    </url>\n";
        }
    }
}

// Página de teste de deploy (se existir)
if (file_exists('../../test-deploy.html')) {
    echo "    <url>\n";
    echo "        <loc>{$baseUrl}/test-deploy.html</loc>\n";
    echo "        <lastmod>" . getLastModified('../../test-deploy.html') . "</lastmod>\n";
    echo "        <changefreq>never</changefreq>\n";
    echo "        <priority>0.1</priority>\n";
    echo "    </url>\n";
}

// Fim do XML
echo "</urlset>\n";
?>
