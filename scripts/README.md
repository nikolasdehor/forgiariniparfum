# Scripts de Desenvolvimento e Segurança

Esta pasta contém scripts auxiliares para desenvolvimento, testes e auditoria de segurança do projeto Forgiarini Parfum.

## ⚠️ Importante
Estes scripts **NÃO** são enviados para o servidor de produção por questões de segurança. Eles ficam apenas no repositório Git para versionamento e uso durante o desenvolvimento.

## Scripts Disponíveis

### 🔒 Segurança
- `check-security.sh` - Verificação básica de segurança
- `security-audit.sh` - Auditoria completa de segurança
- `validate-complete-auth.sh` - Validação de autenticação
- `validate-complete-env-system.sh` - Validação do sistema de ambiente

### 🧪 Testes e Configuração
- `test-env-config.sh` - Teste de configuração do ambiente
- `check-site.sh` - Verificação do site
- `run-tests.sh` - Execução de testes

### 🚀 Deploy e Configuração
- `deploy-manual.sh` / `deploy-manual.bat` - Deploy manual
- `extract-ftp-config.sh` / `.bat` - Extração de configuração FTP
- `setup-deploy.sh` - Configuração de deploy

## Como Usar

1. **No desenvolvimento local**: Execute os scripts diretamente
2. **No GitHub**: Os scripts ficam versionados no repositório
3. **Em produção**: Scripts são automaticamente excluídos do deploy

## Permissões

Alguns scripts têm permissão de execução (`chmod +x`). Se necessário, execute:

```bash
chmod +x scripts/*.sh
```

## Exclusão do Deploy

Esta pasta é excluída do deploy através da configuração no GitHub Actions:

```yaml
exclude: |
  **/scripts/**  # Scripts de desenvolvimento/segurança - não necessários em produção
```

Isso garante que os scripts de desenvolvimento não sejam expostos no servidor de produção.
