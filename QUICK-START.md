# 🚀 Guia Rápido - Deploy Automático

## ⚡ Configuração em 5 Minutos

### 1. Obter Credenciais FTP da HostGator

#### Opção A: Usar arquivo .coreftp (Mais Fácil)
Se você baixou o arquivo `.coreftp` da HostGator:
```bash
chmod +x scripts/extract-ftp-config.sh
./scripts/extract-ftp-config.sh
```

#### Opção B: Manual
- Acesse o cPanel da HostGator
- Procure "Contas FTP" ou "FTP Accounts"
- Anote: servidor, usuário, senha

### 2. Configurar Secrets no GitHub
- Vá para seu repositório no GitHub
- Settings → Secrets and variables → Actions
- Adicione os secrets:
  ```
  FTP_SERVER: ftp.seudominio.com
  FTP_USERNAME: seuusuario@seudominio.com
  FTP_PASSWORD: suasenhasegura
  ```

### 3. Ativar Deploy Automático
Execute no terminal:
```bash
chmod +x scripts/setup-deploy.sh
./scripts/setup-deploy.sh
```

### 4. Testar
```bash
git add .
git commit -m "Teste de deploy automático"
git push origin main
```

## ✅ Pronto!

Agora toda vez que você fizer um commit na branch `main`, os arquivos serão automaticamente enviados para a HostGator!

## 📱 Monitoramento

- **GitHub**: Aba "Actions" para ver status do deploy
- **Site**: https://forgiariniparfum.dehor.dev/
- **Teste**: https://forgiariniparfum.dehor.dev/test-deploy.html

## 🆘 Problemas?

1. **Deploy falha**: Verifique credenciais FTP
2. **Workflow não executa**: Confirme se está na branch `main`
3. **Arquivos não aparecem**: Aguarde 1-2 minutos e limpe cache

## 📖 Documentação Completa

- `DEPLOY-SETUP.md` - Guia detalhado
- `README.md` - Documentação completa

---

**🎉 Agora você tem deploy automático configurado!**
