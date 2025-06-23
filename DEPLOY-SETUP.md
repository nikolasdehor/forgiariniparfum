# 🚀 Configuração de Deploy Automático para HostGator

Este guia te ajudará a configurar o deploy automático dos arquivos do GitHub para a HostGator.

## 📋 Pré-requisitos

1. Repositório no GitHub
2. Conta na HostGator com acesso FTP/SFTP
3. Credenciais FTP da HostGator

## 🔐 Passo 1: Obter Credenciais FTP da HostGator

### Como encontrar suas credenciais FTP:

1. **Acesse o cPanel da HostGator**
2. **Procure por "Contas FTP" ou "FTP Accounts"**
3. **Anote as seguintes informações:**
   - **Servidor FTP**: geralmente `ftp.seudominio.com` ou `ftp.hostgator.com`
   - **Usuário**: seu usuário FTP (pode ser o mesmo do cPanel)
   - **Senha**: sua senha FTP
   - **Porta**: 21 (FTP) ou 22 (SFTP)

### Exemplo de credenciais:
```
Servidor: ftp.forgiariniparfum.dehor.dev
Usuário: forgiariniparfum@dehor.dev
Senha: suaSenhaSegura123
Porta: 21
```

## 🔑 Passo 2: Configurar Secrets no GitHub

### 2.1 Acessar Configurações do Repositório

1. Vá para seu repositório no GitHub
2. Clique em **"Settings"** (Configurações)
3. No menu lateral, clique em **"Secrets and variables"**
4. Clique em **"Actions"**

### 2.2 Adicionar os Secrets

Clique em **"New repository secret"** e adicione cada um dos seguintes secrets:

#### Para FTP (Recomendado):
```
Nome: FTP_SERVER
Valor: ftp.seudominio.com

Nome: FTP_USERNAME  
Valor: seuusuario@seudominio.com

Nome: FTP_PASSWORD
Valor: suasenhasegura
```

#### Para SFTP (Se disponível):
```
Nome: SFTP_SERVER
Valor: sftp.seudominio.com

Nome: SFTP_USERNAME
Valor: seuusuario

Nome: SFTP_PASSWORD
Valor: suasenhasegura

Nome: SFTP_PORT
Valor: 22
```

## 📁 Passo 3: Escolher o Workflow

Você tem 3 opções de workflow. Escolha uma:

### Opção A: Deploy Simples (Recomendado para iniciantes)
- Arquivo: `.github/workflows/deploy.yml`
- Envia todos os arquivos a cada commit
- Mais simples e confiável

### Opção B: Deploy via SFTP (Mais seguro)
- Arquivo: `.github/workflows/deploy-sftp.yml`
- Usa SFTP em vez de FTP
- Requer que a HostGator suporte SFTP

### Opção C: Deploy Avançado (Recomendado para projetos grandes)
- Arquivo: `.github/workflows/deploy-advanced.yml`
- Envia apenas arquivos modificados
- Mais eficiente para projetos grandes

## 🎯 Passo 4: Ativar o Workflow Escolhido

1. **Renomeie o arquivo escolhido** para `deploy.yml`
2. **Desative os outros** renomeando para `.yml.disabled`

Exemplo:
```bash
# Se escolheu a Opção A (Deploy Simples):
mv .github/workflows/deploy.yml .github/workflows/deploy.yml
mv .github/workflows/deploy-sftp.yml .github/workflows/deploy-sftp.yml.disabled
mv .github/workflows/deploy-advanced.yml .github/workflows/deploy-advanced.yml.disabled
```

## 🧪 Passo 5: Testar o Deploy

1. **Faça uma pequena alteração** em qualquer arquivo
2. **Commit e push** para a branch `main`:
   ```bash
   git add .
   git commit -m "Teste de deploy automático"
   git push origin main
   ```
3. **Verifique o GitHub Actions**:
   - Vá para a aba "Actions" no seu repositório
   - Veja se o workflow está executando
   - Verifique os logs para possíveis erros

## 🔍 Passo 6: Verificar no Servidor

1. **Acesse seu site**: `https://forgiariniparfum.dehor.dev/`
2. **Verifique se as alterações** foram aplicadas
3. **Confira os arquivos** no cPanel da HostGator

## ⚠️ Solução de Problemas

### Erro de Conexão FTP
- Verifique se as credenciais estão corretas
- Teste a conexão FTP com um cliente como FileZilla
- Confirme se a porta está correta (21 para FTP, 22 para SFTP)

### Erro de Permissões
- Verifique se o usuário FTP tem permissão de escrita na pasta `public_html`
- Contate o suporte da HostGator se necessário

### Workflow não executa
- Verifique se o arquivo está na pasta `.github/workflows/`
- Confirme se os secrets foram configurados corretamente
- Verifique se o nome da branch está correto (`main` ou `master`)

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do GitHub Actions
2. Consulte a documentação da HostGator
3. Entre em contato com o suporte técnico

---

**✅ Após seguir estes passos, seus commits serão automaticamente enviados para a HostGator!**
