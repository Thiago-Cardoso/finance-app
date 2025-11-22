# 🧪 Guia de Testes - Backend + Frontend

Guia completo para testar a aplicação após deploy.

## 🎯 URLs da Aplicação

- **Backend (Render)**: https://finance-app-api-adbw.onrender.com
- **Frontend (Vercel)**: [Sua URL após deploy]

---

## 🔧 Parte 1: Testar Backend (API)

### 1.1 Health Check

**Teste básico de conectividade:**

```bash
# Via curl
curl https://finance-app-api-adbw.onrender.com/health

# Ou abra no navegador:
# https://finance-app-api-adbw.onrender.com/health
```

**Resultado esperado:**
- Página verde ou HTML com status ok
- Status HTTP 200

### 1.2 Verificar Rotas da API

**Teste sem autenticação (deve retornar erro esperado):**

```bash
curl https://finance-app-api-adbw.onrender.com/api/v1/health
```

**Resultado esperado:**
```json
{
  "success": false,
  "message": "Authentication required",
  "errors": [
    {
      "field": "authorization",
      "message": "Token not provided"
    }
  ]
}
```

✅ **Isso é CORRETO!** Significa que a API está rodando e protegida.

### 1.3 Testar Cadastro de Usuário

```bash
curl -X POST https://finance-app-api-adbw.onrender.com/api/v1/auth/sign_up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "Senha123!",
    "password_confirmation": "Senha123!"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "teste@exemplo.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User created successfully"
}
```

✅ **Anote o token!** Você vai precisar dele para testar rotas autenticadas.

### 1.4 Testar Login

```bash
curl -X POST https://finance-app-api-adbw.onrender.com/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "Senha123!"
  }'
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "teste@exemplo.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Signed in successfully"
}
```

### 1.5 Testar Rota Autenticada (Dashboard)

```bash
# Substitua SEU_TOKEN pelo token recebido acima
curl -X GET https://finance-app-api-adbw.onrender.com/api/v1/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resultado esperado:**
```json
{
  "success": true,
  "data": {
    "balance_summary": {
      "current_balance": "0.00",
      "monthly_income": "0.00",
      "monthly_expenses": "0.00"
    },
    "recent_transactions": [],
    "goals_progress": []
  }
}
```

✅ **Se retornou dados, o backend está 100% funcional!**

### 1.6 Verificar Database (Supabase)

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Seu projeto → **Table Editor**
3. Verifique a tabela `users`
4. Você deve ver o usuário criado!

---

## 🌐 Parte 2: Testar Frontend (Local)

### 2.1 Rodar Localmente

```bash
cd frontend

# Configurar variável de ambiente
export NEXT_PUBLIC_API_URL=https://finance-app-api-adbw.onrender.com/api/v1

# Ou edite .env.local:
echo "NEXT_PUBLIC_API_URL=https://finance-app-api-adbw.onrender.com/api/v1" > .env.local

# Rodar em modo desenvolvimento
npm run dev

# Abrir navegador
open http://localhost:3000
```

### 2.2 Testes no Navegador (Local)

#### Teste 1: Página de Login
1. Abra: http://localhost:3000/auth/login
2. Use as credenciais criadas anteriormente:
   - Email: `teste@exemplo.com`
   - Senha: `Senha123!`
3. Clique em "Entrar"

**Resultado esperado:**
- ✅ Redirecionamento para `/dashboard`
- ✅ Token armazenado (veja no DevTools → Application → Local Storage)

#### Teste 2: Dashboard
1. Após login, deve ver o dashboard
2. Verifique se os cards aparecem:
   - Saldo Atual
   - Receitas do Mês
   - Despesas do Mês
3. Abra DevTools (F12) → Network
4. Veja se a requisição para `/api/v1/dashboard` foi feita

**Resultado esperado:**
- ✅ Status 200
- ✅ Dados retornados
- ✅ Headers de autorização presentes

#### Teste 3: Criar Transação
1. Vá para `/transactions/new`
2. Preencha o formulário:
   - Descrição: "Teste"
   - Valor: 100
   - Tipo: Receita
   - Data: Hoje
3. Salve

**Resultado esperado:**
- ✅ Transação criada
- ✅ Redirecionamento para lista
- ✅ Transação aparece na lista

#### Teste 4: Ver no Supabase
1. Volte ao Supabase Dashboard
2. Table Editor → `transactions`
3. Veja a transação criada!

---

## 🚀 Parte 3: Testar Frontend (Vercel - Após Deploy)

### 3.1 Acesse seu App na Vercel

```
https://seu-app.vercel.app
```

### 3.2 Testes Básicos

**✅ Checklist:**

- [ ] Página inicial carrega
- [ ] Pode acessar `/auth/login`
- [ ] Pode fazer login
- [ ] Dashboard carrega
- [ ] Pode criar transação
- [ ] Pode ver transações
- [ ] Pode criar categoria
- [ ] Pode criar meta
- [ ] Logout funciona

### 3.3 Testar CORS

Abra DevTools (F12) → Console

**Se aparecer erro de CORS:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solução:**
1. Render Dashboard → seu service → Environment
2. Atualize `FRONTEND_URL` com a URL da Vercel
3. Save Changes (vai redeploy)
4. Aguarde 5 minutos
5. Teste novamente

---

## 🔍 Parte 4: Testes de Integração Completos

### 4.1 Fluxo Completo de Usuário

**Cenário: Novo usuário usando a aplicação**

1. **Registro**
   - [ ] Acessar `/auth/register`
   - [ ] Criar conta com email único
   - [ ] Receber token
   - [ ] Redirecionar para dashboard

2. **Dashboard Inicial**
   - [ ] Ver saldo zerado
   - [ ] Ver mensagens de "Nenhuma transação"
   - [ ] Ver cards de resumo

3. **Criar Categorias**
   - [ ] Ir para `/categories`
   - [ ] Criar categoria de Receita
   - [ ] Criar categoria de Despesa
   - [ ] Ver categorias na lista

4. **Criar Transações**
   - [ ] Criar transação de receita
   - [ ] Criar transação de despesa
   - [ ] Ver no dashboard atualizado
   - [ ] Verificar saldo calculado corretamente

5. **Criar Meta**
   - [ ] Ir para `/goals`
   - [ ] Criar meta de economia
   - [ ] Ver progresso (deve estar em 0%)
   - [ ] Fazer contribuição
   - [ ] Ver progresso atualizado

6. **Relatórios**
   - [ ] Ir para `/reports`
   - [ ] Ver gráficos renderizando
   - [ ] Filtrar por período
   - [ ] Exportar (se implementado)

7. **Logout**
   - [ ] Fazer logout
   - [ ] Verificar redirecionamento para login
   - [ ] Tentar acessar dashboard (deve bloquear)

### 4.2 Teste de Performance

```bash
# Testar velocidade do backend
time curl https://finance-app-api-adbw.onrender.com/health

# Resultado esperado: < 2 segundos (primeira vez pode ser ~30s)
```

**Nota:** Render free tier "dorme" após 15 min de inatividade. A primeira requisição após dormir leva ~30 segundos.

### 4.3 Teste de Segurança Básico

```bash
# 1. Tentar acessar rota sem token
curl https://finance-app-api-adbw.onrender.com/api/v1/transactions

# Deve retornar: "Authentication required"

# 2. Tentar usar token inválido
curl -H "Authorization: Bearer token-invalido" \
  https://finance-app-api-adbw.onrender.com/api/v1/dashboard

# Deve retornar: "Invalid token"

# 3. Tentar SQL injection (deve ser bloqueado)
curl -X POST https://finance-app-api-adbw.onrender.com/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com OR 1=1--","password":"test"}'

# Deve retornar: "Invalid credentials"
```

---

## 📊 Parte 5: Monitoramento Contínuo

### 5.1 Health Checks Automáticos

Use um serviço gratuito para monitorar:

**UptimeRobot** (gratuito):
- https://uptimerobot.com
- Adicione monitor HTTP(s)
- URL: `https://finance-app-api-adbw.onrender.com/health`
- Intervalo: 5 minutos
- Receba alertas por email se cair

### 5.2 Verificações Diárias

**Checklist rápido (1 minuto):**

```bash
# 1. Backend está up?
curl -I https://finance-app-api-adbw.onrender.com/health

# 2. Frontend está up?
curl -I https://seu-app.vercel.app

# 3. API responde?
curl https://finance-app-api-adbw.onrender.com/api/v1/health
```

### 5.3 Logs e Debugging

**Render Logs:**
- Dashboard → Service → Logs
- Ver últimas 100 linhas
- Filtrar por erro

**Vercel Logs:**
- Dashboard → Project → Deployments
- Clique no deployment
- Ver Function Logs

**Supabase Logs:**
- Dashboard → Logs
- Ver queries executadas
- Ver erros de conexão

---

## 🐛 Troubleshooting

### Problema: CORS Error

**Sintoma:**
```
Access to fetch has been blocked by CORS policy
```

**Solução:**
1. Render → Environment → `FRONTEND_URL`
2. Deve ser exatamente a URL da Vercel
3. Save e aguarde redeploy

### Problema: Render Timeout

**Sintoma:**
```
Application failed to respond
```

**Solução:**
- Aguarde 30 segundos (primeira requisição)
- Se persistir, veja logs no Render
- Verifique DATABASE_URL

### Problema: Dados Não Aparecem

**Sintoma:**
Dashboard vazio, sem dados

**Diagnóstico:**
```bash
# 1. Verificar se tem token
# DevTools → Application → Local Storage → token

# 2. Verificar requisição
# DevTools → Network → Filtrar por /api/

# 3. Ver resposta
# Status 200? Dados vazios ou erro?
```

---

## ✅ Checklist Final

### Backend
- [ ] Health check responde
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Dashboard retorna dados
- [ ] Tabelas existem no Supabase
- [ ] CORS configurado

### Frontend
- [ ] Build local funciona
- [ ] Deploy na Vercel funciona
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Pode criar transação
- [ ] CORS sem erros
- [ ] Token é salvo

### Integração
- [ ] Frontend → Backend comunicando
- [ ] Dados salvos no Supabase
- [ ] Autenticação funcionando
- [ ] Rotas protegidas
- [ ] Logout funciona

---

## 🎉 Aplicação Testada e Funcionando!

Se todos os testes acima passaram, sua aplicação está 100% funcional em produção! 🚀

**Próximos Passos:**
1. Usar a aplicação normalmente
2. Reportar bugs se encontrar
3. Adicionar features novas
4. Monitorar performance

**Parabéns pelo deploy! 🎊**
