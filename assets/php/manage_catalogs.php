<?php
// Gerenciamento de catálogos - deletar, renomear, etc.
$pdfDir = '../pdf/';

// Cabeçalhos para permitir acesso via AJAX
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Resposta padrão
$response = [
    'success' => false,
    'message' => 'Ação não reconhecida.'
];

// Função para validar nome de arquivo
function isValidFileName($fileName) {
    return preg_match('/^[a-zA-Z0-9\-_\.]+\.pdf$/', $fileName) && !strpos($fileName, '..');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data || !isset($data['action'])) {
        $response['message'] = 'Ação não especificada.';
    } else {
        $action = $data['action'];
        
        switch ($action) {
            case 'delete':
                if (!isset($data['filename'])) {
                    $response['message'] = 'Nome do arquivo não especificado.';
                } else {
                    $fileName = $data['filename'];
                    
                    if (!isValidFileName($fileName)) {
                        $response['message'] = 'Nome de arquivo inválido.';
                    } else {
                        $filePath = $pdfDir . $fileName;
                        
                        if (!file_exists($filePath)) {
                            $response['message'] = 'Arquivo não encontrado.';
                        } else {
                            if (unlink($filePath)) {
                                $response['success'] = true;
                                $response['message'] = 'Arquivo deletado com sucesso.';
                            } else {
                                $response['message'] = 'Erro ao deletar o arquivo.';
                            }
                        }
                    }
                }
                break;
                
            case 'rename':
                if (!isset($data['old_name']) || !isset($data['new_name'])) {
                    $response['message'] = 'Nomes de arquivo não especificados.';
                } else {
                    $oldName = $data['old_name'];
                    $newName = $data['new_name'];
                    
                    // Garantir que o novo nome tenha extensão .pdf
                    if (!str_ends_with(strtolower($newName), '.pdf')) {
                        $newName .= '.pdf';
                    }
                    
                    if (!isValidFileName($oldName) || !isValidFileName($newName)) {
                        $response['message'] = 'Nome de arquivo inválido.';
                    } else {
                        $oldPath = $pdfDir . $oldName;
                        $newPath = $pdfDir . $newName;
                        
                        if (!file_exists($oldPath)) {
                            $response['message'] = 'Arquivo original não encontrado.';
                        } elseif (file_exists($newPath)) {
                            $response['message'] = 'Já existe um arquivo com o novo nome.';
                        } else {
                            if (rename($oldPath, $newPath)) {
                                $response['success'] = true;
                                $response['message'] = 'Arquivo renomeado com sucesso.';
                                $response['new_filename'] = $newName;
                            } else {
                                $response['message'] = 'Erro ao renomear o arquivo.';
                            }
                        }
                    }
                }
                break;
                
            case 'set_primary':
                if (!isset($data['filename'])) {
                    $response['message'] = 'Nome do arquivo não especificado.';
                } else {
                    $fileName = $data['filename'];
                    
                    if (!isValidFileName($fileName)) {
                        $response['message'] = 'Nome de arquivo inválido.';
                    } else {
                        $filePath = $pdfDir . $fileName;
                        
                        if (!file_exists($filePath)) {
                            $response['message'] = 'Arquivo não encontrado.';
                        } else {
                            // Atualizar timestamp para torná-lo o mais recente
                            if (touch($filePath)) {
                                $response['success'] = true;
                                $response['message'] = 'Catálogo definido como principal.';
                            } else {
                                $response['message'] = 'Erro ao definir como principal.';
                            }
                        }
                    }
                }
                break;
                
            default:
                $response['message'] = 'Ação não reconhecida: ' . $action;
        }
    }
}

// Retornar a resposta como JSON
echo json_encode($response);
?>
