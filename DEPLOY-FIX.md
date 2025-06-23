# 🔧 Correção do Erro de Deploy

## ❌ **Problema Identificado**

O erro ocorreu porque você tinha múltiplos workflows ativos e estava usando o workflow SFTP que tem problemas de compatibilidade.

```
Warning: Unexpected input(s) 'exclude', valid inputs are ['entryPoint', 'args', 'username', 'server', 'port', 'ssh_private_key', 'local_path', 'remote_path', 'sftp_only', 'sftpArgs', 'delete_remote_files', 'password']
```

## ✅ **Correções Aplicadas**

### 1. **Workflows Desabilitados**
- ❌ `deploy-sftp.yml` - DESABILITADO (problemas de compatibilidade)
- ❌ `deploy-advanced.yml` - DESABILITADO (evitar conflitos)
- ✅ `deploy.yml` - ATIVO (FTP simples que funciona)

### 2. **Workflow Ativo: deploy.yml**
```yaml
name: Deploy to HostGator
on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: SamKirkland/FTP-Deploy-Action@v4.3.4
      with:
        server: ${{ secrets.FTP_SERVER }}
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        protocol: ftps
        port: 21
        local-dir: ./
        server-dir: /public_html/
```

## 🔐 **Secrets Necessários**

Verifique se você configurou estes secrets no GitHub:

### ✅ **Secrets Corretos (para FTP)**
```
FTP_SERVER: ftp.dehor.dev
FTP_USERNAME: forgiarini@forgiariniparfum.dehor.dev
FTP_PASSWORD: [SUA_SENHA_FTP]
```

### ❌ **NÃO use estes (são para SFTP)**
```
SFTP_SERVER
SFTP_USERNAME
SFTP_PASSWORD
SFTP_PORT
```

## 🚀 **Como Verificar/Corrigir**

### 1. **Verificar Secrets no GitHub**
1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Verifique se tem os 3 secrets FTP_* (não SFTP_*)

### 2. **Se estiver usando SFTP_***
1. **Delete** os secrets SFTP_*
2. **Crie** os secrets FTP_* com os mesmos valores:
   - `SFTP_SERVER` → `FTP_SERVER`
   - `SFTP_USERNAME` → `FTP_USERNAME`
   - `SFTP_PASSWORD` → `FTP_PASSWORD`

### 3. **Testar o Deploy**
```bash
git add .
git commit -m "Corrigir configuração de deploy"
git push origin main
```

## 📊 **Status dos Workflows**

| Workflow | Status | Uso |
|----------|--------|-----|
| `deploy.yml` | ✅ ATIVO | Deploy FTP (recomendado) |
| `deploy-sftp.yml` | ❌ DESABILITADO | Problemas de compatibilidade |
| `deploy-advanced.yml` | ❌ DESABILITADO | Evitar conflitos |

## 🔍 **Como Monitorar**

1. **Após fazer commit**, vá para a aba **Actions** no GitHub
2. **Verifique** se apenas o workflow "Deploy to HostGator" está executando
3. **Aguarde** a conclusão (1-2 minutos)
4. **Teste** o site: https://forgiariniparfum.dehor.dev/

## ⚠️ **Se Ainda Houver Problemas**

### **Erro de Conexão FTP**
```
Connection closed. Connection closed
```

**Possíveis causas:**
1. **Credenciais incorretas** - Verifique FTP_USERNAME e FTP_PASSWORD
2. **Servidor incorreto** - Confirme se é `ftp.dehor.dev`
3. **Porta incorreta** - Deve ser 21 para FTP
4. **Protocolo incorreto** - Tente mudar `ftps` para `ftp`

### **Solução Alternativa**
Se o FTP não funcionar, edite `deploy.yml`:
```yaml
protocol: ftp  # em vez de ftps
port: 21
```

## 📞 **Suporte**

Se o problema persistir:
1. **Verifique** os logs detalhados na aba Actions
2. **Teste** as credenciais FTP com um cliente como FileZilla
3. **Contate** o suporte da HostGator para confirmar configurações FTP

---

**🎯 Agora apenas o workflow FTP simples está ativo e deve funcionar corretamente!**
