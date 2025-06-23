@echo off
REM Script para extrair configurações FTP do arquivo .coreftp da HostGator

echo 🔧 Extrator de Configurações FTP da HostGator
echo =============================================
echo.

REM Procurar arquivo .coreftp
for %%f in (*.coreftp) do set COREFTP_FILE=%%f

if "%COREFTP_FILE%"=="" (
    echo ❌ Erro: Arquivo .coreftp não encontrado
    echo Certifique-se de que o arquivo baixado da HostGator está na pasta do projeto
    pause
    exit /b 1
)

echo 📁 Arquivo encontrado: %COREFTP_FILE%
echo.

REM Extrair informações do arquivo
for /f "tokens=2 delims=," %%a in ('findstr "^Host," "%COREFTP_FILE%"') do set HOST=%%a
for /f "tokens=2 delims=," %%a in ('findstr "^User," "%COREFTP_FILE%"') do set USER=%%a
for /f "tokens=2 delims=," %%a in ('findstr "^Port," "%COREFTP_FILE%"') do set PORT=%%a
for /f "tokens=2 delims=," %%a in ('findstr "^Name," "%COREFTP_FILE%"') do set NAME=%%a

echo 📋 Configurações extraídas:
echo    Servidor: %HOST%
echo    Usuário: %USER%
echo    Porta: %PORT%
echo    Nome: %NAME%
echo.

REM Verificar se as informações foram extraídas
if "%HOST%"=="" (
    echo ❌ Erro: Não foi possível extrair o servidor
    pause
    exit /b 1
)

if "%USER%"=="" (
    echo ❌ Erro: Não foi possível extrair o usuário
    pause
    exit /b 1
)

echo ✅ Informações extraídas com sucesso!
echo.

echo 🔐 Configuração dos Secrets do GitHub
echo =====================================
echo.
echo Para configurar o deploy automático, você precisa adicionar estes secrets no GitHub:
echo.
echo 1. Vá para: Settings → Secrets and variables → Actions
echo 2. Clique em 'New repository secret'
echo 3. Adicione os seguintes secrets:
echo.
echo    Nome: FTP_SERVER
echo    Valor: %HOST%
echo.
echo    Nome: FTP_USERNAME
echo    Valor: %USER%
echo.
echo    Nome: FTP_PASSWORD
echo    Valor: [SUA_SENHA_FTP]
echo.

REM Criar arquivo de configuração local
echo # Configurações FTP extraídas do arquivo HostGator > ftp-config.txt
echo # Use estas informações para configurar os secrets no GitHub >> ftp-config.txt
echo. >> ftp-config.txt
echo FTP_SERVER=%HOST% >> ftp-config.txt
echo FTP_USERNAME=%USER% >> ftp-config.txt
echo FTP_PORT=%PORT% >> ftp-config.txt
echo FTP_PASSWORD=[INSIRA_SUA_SENHA_AQUI] >> ftp-config.txt
echo. >> ftp-config.txt
echo # Para configurar no GitHub: >> ftp-config.txt
echo # 1. Vá para Settings → Secrets and variables → Actions >> ftp-config.txt
echo # 2. Adicione cada secret acima (exceto FTP_PORT, que é opcional) >> ftp-config.txt
echo. >> ftp-config.txt
echo # IMPORTANTE: Não commite este arquivo com a senha real! >> ftp-config.txt

echo 📝 Arquivo de configuração criado: ftp-config.txt
echo    (Use como referência para configurar os secrets)
echo.

echo 📖 Próximos passos:
echo 1. Configure os secrets no GitHub usando as informações acima
echo 2. Execute: scripts\setup-deploy.sh (ou use Git Bash)
echo 3. Faça commit e push para testar
echo.

echo 🎉 Configuração concluída!
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
