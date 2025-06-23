# 🔒 Checklist de Segurança - Antes de Publicar

## ❌ ARQUIVOS QUE **NÃO DEVEM** SER PUBLICADOS

### 🚨 **CRÍTICOS - Remover Imediatamente**
- ❌ `.env` - **CONTÉM SENHA REAL DO ADMIN!**
- ❌ `ftp-config.txt` - Credenciais FTP
- ❌ `*.coreftp` - Arquivo de configuração da HostGator
- ❌ Qualquer arquivo com senhas reais

### ⚠️ **Sensíveis - Verificar Conteúdo**
- ⚠️ `assets/php/check_password.php` - Verificar se não tem senha hardcoded
- ⚠️ `admin.html` - Verificar fallback de senha no JavaScript

## ✅ ARQUIVOS SEGUROS PARA PUBLICAR

### 📄 **Arquivos Principais**
- ✅ `index.html` - Página principal
- ✅ `admin.html` - Painel admin (sem senhas hardcoded)
- ✅ `robots.txt` - SEO
- ✅ `README.md` - Documentação
- ✅ `.htaccess` - Configurações do servidor

### 📁 **Pastas de Assets**
- ✅ `assets/css/` - Estilos
- ✅ `assets/js/` - Scripts
- ✅ `assets/images/` - Imagens
- ✅ `assets/videos/` - Vídeos
- ✅ `assets/pdf/` - Catálogos (se não contém info sensível)
- ✅ `assets/php/` - Scripts PHP (após verificação)

### 🔧 **Arquivos de Deploy**
- ✅ `.github/workflows/` - Workflows do GitHub Actions
- ✅ `scripts/` - Scripts de deploy (sem credenciais)
- ✅ `DEPLOY-SETUP.md` - Guia de configuração
- ✅ `QUICK-START.md` - Guia rápido

### 🛡️ **Arquivos de Proteção**
- ✅ `.gitignore` - Lista de arquivos ignorados
- ✅ `SECURITY-CHECKLIST.md` - Este arquivo

## 🔧 CORREÇÕES NECESSÁRIAS

### 1. Criar .env.example
Arquivo de exemplo sem dados sensíveis para outros desenvolvedores.

### 2. Verificar Hardcoded Passwords
Remover qualquer senha que esteja diretamente no código.

### 3. Atualizar .gitignore
Garantir que todos os arquivos sensíveis estão protegidos.

### 4. Limpar Histórico Git (se necessário)
Se arquivos sensíveis já foram commitados.

## 📋 CHECKLIST FINAL

Antes de publicar, verifique:

- [ ] Arquivo `.env` está no `.gitignore`
- [ ] Não há senhas reais no código
- [ ] Arquivo `.coreftp` está protegido
- [ ] `ftp-config.txt` está no `.gitignore`
- [ ] Scripts não contêm credenciais
- [ ] Documentação não revela informações sensíveis
- [ ] Testou o `.gitignore` com `git status`

## 🚀 APÓS PUBLICAR

1. **Configure os secrets** no GitHub (não no código)
2. **Teste o deploy** em ambiente de desenvolvimento primeiro
3. **Monitore os logs** para vazamentos acidentais
4. **Mantenha credenciais atualizadas** nos secrets

## 📞 EM CASO DE VAZAMENTO

Se acidentalmente publicar dados sensíveis:

1. **Remova imediatamente** do repositório
2. **Altere todas as senhas** expostas
3. **Force push** para limpar histórico (se necessário)
4. **Revogue credenciais** comprometidas

---

**⚠️ LEMBRE-SE: Uma vez na internet, sempre na internet!**
