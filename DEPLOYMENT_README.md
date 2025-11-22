# 🚀 Deployment Configuration - Finance App

## 📁 Arquivos de Configuração

Este projeto está configurado para deploy automático usando:
- **Backend**: Render (Rails API)
- **Database**: Supabase (PostgreSQL)
- **Frontend**: Vercel (Next.js)
- **CI/CD**: GitHub Actions

### 📂 Estrutura de Arquivos

```
finance-app/
├── .github/workflows/
│   ├── ci.yml                    # Testes e lint
│   ├── deploy-backend.yml        # Deploy Render
│   └── deploy-frontend.yml       # Deploy Vercel
├── backend/
│   ├── bin/
│   │   ├── render-build.sh       # Script de build
│   │   └── generate-secrets.rb   # Gerador de secrets
│   └── config/
│       ├── initializers/cors.rb  # CORS configurável
│       └── routes.rb             # Health check
├── frontend/
│   ├── .env.production           # Env vars template
│   └── vercel.json               # Config Vercel
├── render.yaml                   # Config Render
├── .env.production.example       # Template env vars
├── SUPABASE_SETUP.md             # Guia de configuração Supabase
├── DEPLOYMENT_GUIDE.md           # Guia completo (LEIA PRIMEIRO!)
├── QUICK_START_DEPLOY.md         # Quick start 15 min
├── DEPLOYMENT_SUMMARY.md         # Resumo executivo
└── SECURITY_CHECKLIST.md         # Security checklist
```

## 🎯 Como Usar

### 🚦 Começando

**Primeira vez deployando?**
👉 Leia: [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md) (15 minutos)

**Quer entender tudo em detalhes?**
👉 Leia: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) (guia completo)

**Já deployou e quer referência rápida?**
👉 Use: [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)

### 🔐 Segurança

Antes de ir para produção:
👉 Revise: [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

## 🛠️ Setup Rápido

### 1. Gerar Secrets
```bash
cd backend
ruby bin/generate-secrets.rb
```

### 2. Configurar Supabase
- Obter DATABASE_URL do seu projeto
- Copiar connection string (com pooling)

### 3. Deploy Backend (Render)
- Criar Web Service
- Configurar variáveis de ambiente (incluindo DATABASE_URL)
- Deploy!
- Migrations rodarão automaticamente no Supabase

### 4. Deploy Frontend (Vercel)
- Importar projeto do GitHub
- Configurar variáveis de ambiente
- Deploy!

### 5. GitHub Actions (Opcional)
- Adicionar secrets no GitHub
- Push para master
- CI/CD automático! 🎉

## 📊 Status do Projeto

### ✅ Configurado
- [x] CORS para produção
- [x] Health check endpoints
- [x] Build scripts
- [x] GitHub Actions workflows
- [x] Vercel configuration
- [x] Render configuration
- [x] Environment variables templates
- [x] Documentação completa

### 🎯 Próximas Ações
1. Seguir [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)
2. Deploy no Render
3. Deploy na Vercel
4. Configurar GitHub Actions
5. Testar integração

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
# Backend
cd backend
bundle install
rails db:create db:migrate
rails server -p 3001

# Frontend
cd frontend
npm install
npm run dev
```

### Testes
```bash
# Backend
cd backend
bundle exec rspec
bundle exec rubocop

# Frontend
cd frontend
npm run test:ci
npm run lint
npm run type-check
```

### Deploy Manual
```bash
# Backend: Render Dashboard ou webhook

# Frontend
cd frontend
vercel --prod
```

## 📚 Documentação

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md) | Deploy em 15 minutos | Primeira vez |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) | Configurar Supabase | Setup do database |
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Guia completo passo a passo | Referência detalhada |
| [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) | Resumo executivo | Quick reference |
| [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) | Checklist de segurança | Antes de produção |
| [.env.production.example](./.env.production.example) | Template de env vars | Configuração |

## 🌐 URLs de Produção

Após deploy, suas URLs serão:
```
Backend:  https://finance-app-api-xxxxx.onrender.com
Frontend: https://finance-app-xxxxx.vercel.app
```

## 🤝 Suporte

Problemas no deploy?
1. Consulte [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) → Troubleshooting
2. Verifique logs (Render/Vercel)
3. Abra uma issue no GitHub

## 📈 Monitoring

### Health Checks
- Backend: `/health`
- Frontend: Homepage

### Logs
- Render: Dashboard → Logs
- Vercel: Dashboard → Deployments → Function Logs
- GitHub Actions: Actions tab

## ⚡ Performance

### Free Tier Limits
**Render:**
- Database: 1GB
- Service: Dorme após 15 min inatividade
- 750h/mês runtime

**Vercel:**
- 100 GB bandwidth/mês
- 6000 min build/mês
- Deployments ilimitados

## 🎉 Pronto para Deploy!

1. ✅ Leia [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)
2. ✅ Gere seus secrets
3. ✅ Siga o guia passo a passo
4. 🚀 Deploy!

---

**Boa sorte com seu deploy!** 🎊

Se tiver dúvidas, consulte os guias ou abra uma issue.
