@echo off
REM Script para deploy manual via FTP no Windows
REM Use este script se quiser fazer deploy manual sem usar GitHub Actions

echo 🚀 Deploy Manual para HostGator
echo ================================

REM Verificar se as variáveis de ambiente estão definidas
if "%FTP_SERVER%"=="" (
    echo ❌ Erro: Variáveis de ambiente não configuradas
    echo.
    echo Configure as seguintes variáveis:
    echo set FTP_SERVER=ftp.seudominio.com
    echo set FTP_USERNAME=seuusuario
    echo set FTP_PASSWORD=suasenha
    echo.
    pause
    exit /b 1
)

if "%FTP_USERNAME%"=="" (
    echo ❌ Erro: FTP_USERNAME não configurado
    pause
    exit /b 1
)

if "%FTP_PASSWORD%"=="" (
    echo ❌ Erro: FTP_PASSWORD não configurado
    pause
    exit /b 1
)

echo 📡 Conectando ao servidor: %FTP_SERVER%
echo 👤 Usuário: %FTP_USERNAME%
echo.

REM Verificar se WinSCP está disponível
where winscp >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Erro: WinSCP não encontrado
    echo Baixe e instale o WinSCP: https://winscp.net/
    pause
    exit /b 1
)

echo 📁 Preparando arquivos para upload...

REM Criar script temporário para WinSCP
echo open ftp://%FTP_USERNAME%:%FTP_PASSWORD%@%FTP_SERVER% > temp_script.txt
echo cd /public_html >> temp_script.txt
echo lcd . >> temp_script.txt
echo synchronize remote -delete -filemask="*.html;*.css;*.js;*.php;*.pdf;*.png;*.jpg;*.jpeg;*.gif;*.svg;*.mp4;*.webm;.htaccess;robots.txt" >> temp_script.txt
echo exit >> temp_script.txt

echo ⏳ Sincronizando arquivos...
echo Isso pode levar alguns minutos...

REM Executar WinSCP com o script
winscp /console /script=temp_script.txt

REM Limpar arquivo temporário
del temp_script.txt

if %errorlevel% equ 0 (
    echo.
    echo ✅ Deploy concluído com sucesso!
    echo 🌐 Verifique seu site: https://forgiariniparfum.dehor.dev/
) else (
    echo.
    echo ❌ Erro durante o deploy
    echo Verifique suas credenciais e conexão
)

pause
