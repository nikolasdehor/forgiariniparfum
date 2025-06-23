# Forgiarini Parfum - Site Oficial

Site oficial da Forgiarini Parfum, especializada em fragrâncias premium equivalentes.

## 🚀 Correções Implementadas

### Problema Resolvido
- **Antes**: O site só abria com `https://forgiariniparfum.dehor.dev/index.html`
- **Depois**: Agora abre corretamente com `https://forgiariniparfum.dehor.dev/`

### Principais Mudanças

#### 1. Correção do .htaccess
- Removido redirecionamento para pasta inexistente `forgiariniparfum/`
- Configurado `DirectoryIndex index.html` para página padrão
- Adicionado redirecionamento automático para `index.html` na raiz
- Melhoradas regras de reescrita para URLs limpas

#### 2. Segurança Aprimorada
- Proteção de arquivos sensíveis (`.htaccess`, `.env`, arquivos de backup)
- Bloqueio de listagem de diretórios
- Cabeçalhos de segurança HTTP
- Proteção contra acesso a arquivos de configuração

#### 3. Performance Otimizada
- Compressão GZIP para arquivos texto
- Cache otimizado para diferentes tipos de arquivo
- Headers de cache apropriados

#### 4. Arquivos Removidos
- `index.php` (desnecessário)
- `info.php` (desnecessário)

#### 5. Arquivos Criados/Melhorados
- `.gitignore` - Proteção de arquivos sensíveis no Git
- `robots.txt` - SEO e controle de bots
- `.env` - Configurações seguras (já existia)

## 📁 Estrutura do Projeto

```
forgiariniparfum/
├── index.html              # Página principal
├── admin.html              # Painel administrativo
├── .htaccess               # Configurações do servidor
├── .env                    # Variáveis de ambiente (protegido)
├── .gitignore              # Arquivos ignorados pelo Git
├── robots.txt              # Instruções para bots
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── images/
│   ├── videos/
│   ├── pdf/
│   └── php/
│       ├── check_password.php
│       ├── get_catalog_info.php
│       └── upload_catalog.php
└── README.md
```

## 🚀 Deploy Automático

### Configuração Rápida
1. **Configure os secrets no GitHub** (veja `DEPLOY-SETUP.md`)
2. **Execute o script de configuração**:
   ```bash
   chmod +x scripts/setup-deploy.sh
   ./scripts/setup-deploy.sh
   ```
3. **Faça commit e push** - o deploy será automático!

### Workflows Disponíveis
- **Deploy Simples**: Envia todos os arquivos (recomendado)
- **Deploy SFTP**: Mais seguro, usa SFTP
- **Deploy Avançado**: Envia apenas arquivos modificados

### Deploy Manual
Se preferir fazer deploy manual:
```bash
# Linux/macOS
chmod +x scripts/deploy-manual.sh
./scripts/deploy-manual.sh

# Windows
scripts\deploy-manual.bat
```

## 🔧 Configuração no Servidor

### 1. Deploy Automático (Recomendado)
O deploy é feito automaticamente via GitHub Actions após cada commit na branch `main`.

### 2. Upload Manual (Alternativo)
Se não usar deploy automático, faça upload dos arquivos para `public_html` da HostGator.

### 3. Permissões
Certifique-se de que as seguintes permissões estão configuradas:
- `.htaccess`: 644
- `.env`: 600 (mais restritivo)
- Pasta `assets/pdf/`: 755 (para uploads)
- Arquivos PHP: 644

### 4. Verificação
Após o deploy, teste:
- `https://forgiariniparfum.dehor.dev/` - Deve abrir a página principal
- `https://forgiariniparfum.dehor.dev/admin.html` - Painel administrativo
- `https://forgiariniparfum.dehor.dev/test-deploy.html` - Teste de deploy (remover após confirmar)

## 🔐 Acesso Administrativo

- **URL**: `https://forgiariniparfum.dehor.dev/admin.html`
- **Senha**: Configurada no arquivo `.env`
- **Funcionalidades**: Upload de catálogos PDF

## 🛡️ Segurança

### Arquivos Protegidos
- `.htaccess` - Configurações do servidor
- `.env` - Variáveis de ambiente
- Arquivos de backup (`.bak`, `.backup`, etc.)
- Logs e arquivos temporários

### Headers de Segurança
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security` (HTTPS)

## 📈 Performance

### Cache Configurado
- **Imagens**: 1 ano
- **CSS/JS**: 1 mês
- **HTML**: 1 dia
- **PDFs**: 1 mês

### Compressão
- Todos os arquivos texto são comprimidos com GZIP
- Redução significativa no tempo de carregamento

## 🔍 SEO

### robots.txt
- Permite indexação do site principal
- Bloqueia áreas administrativas
- Permite acesso a recursos públicos

### URLs Limpas
- Suporte a URLs sem extensão `.html`
- Redirecionamentos automáticos

## 🔄 Como Usar o Deploy Automático

### Fluxo de Trabalho
1. **Faça suas alterações** nos arquivos localmente
2. **Commit as mudanças**:
   ```bash
   git add .
   git commit -m "Descrição das alterações"
   ```
3. **Push para o GitHub**:
   ```bash
   git push origin main
   ```
4. **Aguarde o deploy** - será automático em 1-2 minutos
5. **Verifique o site** para confirmar as alterações

### Monitoramento
- **GitHub Actions**: Vá para a aba "Actions" no repositório
- **Logs detalhados**: Clique no workflow para ver logs
- **Status**: ✅ Sucesso | ❌ Erro | 🟡 Em andamento

## 🛠️ Manutenção e Troubleshooting

### Problemas Comuns

#### Deploy falha com erro de conexão
```bash
# Verifique as credenciais FTP
# Teste conexão manual:
ftp ftp.seudominio.com
```

#### Arquivos não aparecem no site
- Verifique se o deploy foi concluído com sucesso
- Confirme se os arquivos estão na pasta `public_html`
- Limpe o cache do navegador (Ctrl+F5)

#### Workflow não executa
- Verifique se está na branch `main` ou `master`
- Confirme se os secrets estão configurados
- Verifique se o arquivo workflow está ativo

### Comandos Úteis

```bash
# Verificar status do repositório
git status

# Ver histórico de commits
git log --oneline

# Forçar push (use com cuidado)
git push origin main --force

# Verificar branches
git branch -a
```

### Logs e Debugging
- **GitHub Actions**: Logs detalhados de cada deploy
- **Browser DevTools**: F12 para verificar erros JavaScript
- **HostGator cPanel**: Logs de erro do servidor

## 📞 Suporte

Para dúvidas ou problemas:
- **Deploy**: Consulte `DEPLOY-SETUP.md`
- **Site**: WhatsApp +55 42 8409-9552
- **GitHub**: Verifique a aba "Issues" do repositório

## 📚 Arquivos de Documentação

- `README.md` - Este arquivo (visão geral)
- `DEPLOY-SETUP.md` - Guia detalhado de configuração do deploy
- `.github/workflows/` - Configurações de deploy automático
- `scripts/` - Scripts auxiliares para deploy manual

---

**Desenvolvido para Forgiarini Parfum** 🌟

### 🎯 Próximos Passos Recomendados

1. **Configure o deploy automático** seguindo `DEPLOY-SETUP.md`
2. **Teste com uma pequena alteração** para verificar funcionamento
3. **Configure backup automático** dos arquivos importantes
4. **Monitore os logs** regularmente para detectar problemas
5. **Mantenha as credenciais seguras** e atualizadas

