# 🚀 Quick Start - Deploy em 15 minutos

Guia rápido para colocar a aplicação no ar.

## ⚡ Pré-requisitos (5 min)

1. Criar conta no [Render](https://render.com) ✅
2. Criar conta no [Vercel](https://vercel.com) ✅
3. Ter repositório no GitHub ✅

## 📝 Passo 1: Gerar Secrets (1 min)

```bash
cd backend
ruby bin/generate-secrets.rb
```

Copie os valores gerados. Você vai precisar deles.

## 🗄️ Passo 2: Supabase - Obter DATABASE_URL (1 min)

1. [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto (você já tem criado)
3. **Settings** → **Database**
4. **Connection string** → **URI**
5. Copie a connection string
6. Substitua `[YOUR-PASSWORD]` pela senha do projeto

Formato:
```
postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

💡 **Dica**: Use a string com `pooler.supabase.com` (connection pooling)

## 🖥️ Passo 3: Render - Backend (5 min)

1. **New +** → **Web Service**
2. Conectar repositório GitHub `finance-app`
3. Configurar:
   ```
   Name: finance-app-api
   Region: Oregon (US West)
   Branch: master
   Root Directory: backend
   Runtime: Ruby
   Build Command: ./bin/render-build.sh
   Start Command: bundle exec rails server -b 0.0.0.0 -p $PORT
   Plan: Free
   ```

4. **Environment Variables** (antes de criar):
   ```bash
   RAILS_ENV=production
   RAILS_LOG_TO_STDOUT=true
   RAILS_SERVE_STATIC_FILES=true
   RAILS_MAX_THREADS=5
   DATABASE_URL=[Cole Supabase connection string aqui]
   SECRET_KEY_BASE=[Cole secret gerado]
   JWT_SECRET_KEY=[Cole outro secret gerado]
   FRONTEND_URL=https://placeholder.vercel.app  # Vai atualizar depois
   ```

5. **Create Web Service**
6. ⏳ Aguarde build (5-8 minutos)
7. ✅ Copie a URL: `https://finance-app-api-xxxxx.onrender.com`

## 🌐 Passo 4: Vercel - Frontend (3 min)

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New...** → **Project**
2. Importar `finance-app` do GitHub
3. Configurar:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables**:
   ```bash
   NEXT_PUBLIC_API_URL=[Cole URL do Render]/api/v1
   NEXT_PUBLIC_APP_NAME=Finance App
   NEXT_PUBLIC_APP_VERSION=1.0.0
   NODE_ENV=production
   ```

5. **Deploy**
6. ⏳ Aguarde build (3-5 minutos)
7. ✅ Copie a URL: `https://finance-app-xxxxx.vercel.app`

## 🔄 Passo 5: Atualizar FRONTEND_URL (1 min)

1. Volte ao Render → seu Web Service
2. **Environment** → Edite `FRONTEND_URL`
3. Cole a URL da Vercel
4. **Save Changes** (vai re-deploy automático)

## ✅ Passo 6: Testar (2 min)

### Backend
```bash
curl https://finance-app-api-xxxxx.onrender.com/health
```
Deve retornar: `{"status":"ok"}`

### Frontend
Abra no navegador:
```
https://finance-app-xxxxx.vercel.app
```

### Integração
1. Abra o frontend
2. Tente fazer login/criar conta
3. Se funcionar → 🎉 **Deploy completo!**

## 🤖 Passo 7 (Opcional): GitHub Actions (3 min)

### Obter Tokens

**Render:**
1. [API Keys](https://dashboard.render.com/u/YOUR_USER/settings#api-keys)
2. Create API Key → Copie
3. Service ID: Na URL do service `srv-xxxxx`

**Vercel:**
```bash
cd frontend
npm install -g vercel
vercel login
vercel link  # Escolha seu projeto
cat .vercel/project.json  # Copie orgId e projectId
```

Token: [Vercel Tokens](https://vercel.com/account/tokens) → Create Token

### Adicionar Secrets no GitHub

Repository → **Settings** → **Secrets and variables** → **Actions** → **New secret**

```bash
RENDER_API_KEY=[seu_token_render]
RENDER_SERVICE_ID=srv-xxxxx
VERCEL_TOKEN=[seu_token_vercel]
VERCEL_ORG_ID=[do .vercel/project.json]
VERCEL_PROJECT_ID=[do .vercel/project.json]
```

### Testar
```bash
git add .
git commit -m "chore: configure deployment"
git push origin master
```

Veja em: **Actions** tab no GitHub

## 📊 Monitoramento

### Health Checks
- Backend: `https://seu-backend.onrender.com/health`
- Frontend: Homepage

### Logs
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → Function Logs

## 🐛 Problemas Comuns

### Backend retorna 500
```bash
# Verifique os logs no Render
# Comum: DATABASE_URL ou SECRET_KEY_BASE faltando
```

### Frontend não carrega dados
```bash
# 1. Verifique NEXT_PUBLIC_API_URL na Vercel
# 2. Teste backend direto: curl https://backend.onrender.com/health
# 3. Verifique CORS no backend
```

### Render free tier dorme
```bash
# Normal! Primeira requisição após 15 min demora ~30 segundos
# Considere: https://render.com/docs/free#spinning-down-on-idle
```

## 📚 Precisa de Mais Ajuda?

- 📖 [Guia Completo](./DEPLOYMENT_GUIDE.md) - Instruções detalhadas
- 📝 [Resumo](./DEPLOYMENT_SUMMARY.md) - Overview da configuração
- 🔧 [Variáveis](./.env.production.example) - Template completo

## 🎉 Próximos Passos

Depois do deploy:
- [ ] Configurar domínio customizado
- [ ] Adicionar monitoring (Sentry)
- [ ] Configurar backups do database
- [ ] Adicionar SSL/HTTPS (automático na Vercel e Render)

---

**Parabéns! Sua aplicação está no ar!** 🚀
