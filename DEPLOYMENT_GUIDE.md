# Guia de Deploy - Finance App

Este guia fornece instruções completas para fazer deploy da aplicação Finance App usando a arquitetura híbrida:
- **Backend (Rails API)**: Render + PostgreSQL
- **Frontend (Next.js)**: Vercel

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Conta no [Vercel](https://vercel.com)
3. Repositório no GitHub
4. Node.js 20+ e Ruby 3.2.0 instalados localmente

## 🚀 Parte 1: Deploy do Backend (Render + Supabase)

### 1.1 Configurar Supabase Database

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto existente (ou crie um novo se necessário)
3. Vá em **Settings** → **Database**
4. Role até **Connection string** → selecione **URI**
5. Copie a connection string
6. Substitua `[YOUR-PASSWORD]` pela senha do seu projeto Supabase

**Connection String recomendada (com pooling):**
```
postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

💡 **Dica**: Use a URL com `pooler.supabase.com:6543` para melhor performance

📖 **Guia detalhado**: Veja [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) para mais informações

### 1.2 Criar Conta Render e Conectar GitHub

1. Acesse [Render](https://render.com) e crie uma conta
2. Conecte sua conta do GitHub ao Render
3. Autorize acesso ao repositório `finance-app`

### 1.3 Criar Serviço Web no Render

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Selecione o repositório `finance-app`
3. Configure o serviço:
   - **Name**: `finance-app-api`
   - **Region**: `Oregon (US West)`
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Ruby`
   - **Build Command**: `./bin/render-build.sh`
   - **Start Command**: `bundle exec rails server -b 0.0.0.0 -p $PORT`
   - **Plan**: `Free`

### 1.4 Configurar Variáveis de Ambiente no Render

No painel do seu Web Service, vá em **"Environment"** e adicione:

```bash
# Rails Configuration
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
RAILS_MAX_THREADS=5

# Supabase Database
DATABASE_URL=[Cole a Supabase connection string aqui]

# Secrets (gere com: rails secret ou ruby bin/generate-secrets.rb)
SECRET_KEY_BASE=[Cole o secret gerado]
JWT_SECRET_KEY=[Cole outro secret gerado]

# Frontend URL (será atualizado após deploy da Vercel)
FRONTEND_URL=https://seu-app.vercel.app
```

**Gerando Secrets:**
```bash
cd backend
ruby bin/generate-secrets.rb
# OU
bundle exec rails secret
```

### 1.5 Configurar Health Check

No Render, em **"Settings"** → **"Health Check Path"**, configure:
```
/health
```

### 1.6 Deploy Manual (Primeira vez)

1. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde o build e deploy (pode levar 5-10 minutos)
3. Verifique os logs em **"Logs"**
4. As migrations rodarão automaticamente no Supabase
5. Teste o endpoint: `https://seu-app.onrender.com/health`

### 1.7 Verificar Tabelas no Supabase

Após o primeiro deploy:
1. Volte ao [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Table Editor**
3. Você deve ver as tabelas criadas: users, accounts, categories, transactions, etc.

📖 **Mais detalhes**: Consulte [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🌐 Parte 2: Deploy do Frontend (Vercel)

### 2.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Login na Vercel

```bash
vercel login
```

### 2.3 Configurar Projeto na Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe o repositório `finance-app` do GitHub
4. Configure o projeto:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2.4 Configurar Variáveis de Ambiente na Vercel

Na aba **"Settings"** → **"Environment Variables"**, adicione:

#### Production
```bash
NEXT_PUBLIC_API_URL=https://finance-app-api.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=Finance App
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

#### Preview (opcional)
```bash
NEXT_PUBLIC_API_URL=https://finance-app-api-staging.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=Finance App (Preview)
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=preview
```

### 2.5 Deploy Manual (Primeira vez)

```bash
cd frontend
vercel --prod
```

Ou clique em **"Deploy"** no dashboard da Vercel.

### 2.6 Atualizar FRONTEND_URL no Render

Após o deploy na Vercel:
1. Copie a URL do seu app (ex: `https://finance-app-xyz.vercel.app`)
2. Volte ao Render → seu Web Service → **"Environment"**
3. Atualize a variável `FRONTEND_URL` com a URL da Vercel
4. Clique em **"Save Changes"** (isso vai redeploy o backend)

## 🔐 Parte 3: Configurar GitHub Actions

### 3.1 Secrets do GitHub

Acesse **Settings** → **Secrets and variables** → **Actions** no seu repositório e adicione:

#### Para Render
```bash
RENDER_API_KEY=seu_api_key_render
RENDER_SERVICE_ID=seu_service_id
```

**Como obter:**
- **API Key**: Render Dashboard → Account Settings → API Keys
- **Service ID**: Na URL do seu service (ex: `srv-xxxxx`)

#### Para Vercel
```bash
VERCEL_TOKEN=seu_token_vercel
VERCEL_ORG_ID=seu_org_id
VERCEL_PROJECT_ID=seu_project_id
```

**Como obter:**
```bash
cd frontend
vercel link

# O comando acima criará .vercel/project.json com orgId e projectId
cat .vercel/project.json
```

- **Token**: Vercel Dashboard → Settings → Tokens → Create Token

### 3.2 Testar Workflows

Faça um commit e push:
```bash
git add .
git commit -m "chore: configure CI/CD pipelines"
git push origin master
```

Verifique a execução em **Actions** no GitHub.

## 📊 Parte 4: Monitoramento e Manutenção

### 4.1 Logs

**Render:**
- Acesse o dashboard → seu service → **"Logs"**

**Vercel:**
- Acesse o dashboard → seu project → **"Deployments"** → clique em um deployment → **"Function Logs"**

### 4.2 Monitoramento de Saúde

Configure alertas:
- **Render**: Settings → Notifications
- **Vercel**: Settings → Integrations → Monitoring tools

### 4.3 Backup do Database (Supabase)

**Free tier**: Faça backup manual periodicamente
```bash
# Exportar database do Supabase
pg_dump "postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" > backup-$(date +%Y%m%d).sql

# Restaurar database
psql "postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < backup.sql
```

**Supabase Pro**:
- Backups diários automáticos
- Point-in-time recovery
- 7 dias de retenção

📖 **Mais detalhes**: Veja seção "Backups" em [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## 🔄 Parte 5: Fluxo de Deploy Contínuo

### 5.1 Deploy Automático

Após configurar GitHub Actions:

1. **Faça alterações no código**
2. **Commit e push para master**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin master
   ```
3. **GitHub Actions roda automaticamente:**
   - Testes do backend
   - Testes do frontend
   - Deploy no Render (se backend mudou)
   - Deploy na Vercel (se frontend mudou)

### 5.2 Rollback (se necessário)

**Render:**
- Dashboard → Service → Deployments → Selecione deployment anterior → **"Redeploy"**

**Vercel:**
- Dashboard → Project → Deployments → Selecione deployment anterior → **"Promote to Production"**

## ✅ Checklist de Deploy

- [ ] Supabase DATABASE_URL obtida e configurada
- [ ] Backend deployado no Render
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Migrations executadas no Supabase
- [ ] Tabelas verificadas no Supabase Dashboard
- [ ] Health check funcionando (`/health`)
- [ ] Frontend deployado na Vercel
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] CORS configurado corretamente
- [ ] Secrets do GitHub Actions configurados
- [ ] CI/CD workflows testados e funcionando
- [ ] Teste de integração frontend-backend realizado
- [ ] URLs atualizadas (FRONTEND_URL no Render)

## 🐛 Troubleshooting

### Backend não inicia no Render
- Verifique os logs: `Logs` no dashboard
- Confirme que `DATABASE_URL` do Supabase está correta
- Verifique se `SECRET_KEY_BASE` e `JWT_SECRET_KEY` estão definidos
- Confirme que a senha do Supabase está correta na connection string
- Verifique se as migrations rodaram: `bundle exec rails db:migrate`
- Teste a conexão com Supabase localmente primeiro

### Frontend não conecta com backend
- Verifique `NEXT_PUBLIC_API_URL` na Vercel
- Confirme que CORS está configurado no backend
- Teste o endpoint diretamente: `curl https://seu-backend.onrender.com/health`
- Verifique os logs do browser (DevTools → Console)

### GitHub Actions falhando
- Verifique os secrets estão configurados
- Confirme os nomes das variáveis no workflow
- Veja os logs da Action que falhou
- Teste localmente antes de fazer push

## 📚 Recursos

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Rails Deployment Guide](https://guides.rubyonrails.org/deployment.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs (Render e Vercel)
2. Consulte este guia
3. Verifique as issues do repositório
4. Abra uma issue com detalhes do erro
