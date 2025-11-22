# 🚀 Configuração do Supabase

Guia para configurar o Supabase como banco de dados do Finance App.

## 📋 O que é Supabase?

Supabase é uma alternativa open-source ao Firebase que oferece:
- ✅ PostgreSQL gerenciado
- ✅ API REST automática
- ✅ Real-time subscriptions
- ✅ Authentication
- ✅ Storage
- ✅ **Free tier generoso**: 500MB database, 1GB bandwidth

## 🎯 Vantagens para este projeto

- **Gratuito**: 500MB é suficiente para aplicação pessoal
- **Sempre ativo**: Não dorme como Render free tier
- **Global**: CDN e edge functions
- **Fácil**: Dashboard intuitivo
- **Backup**: Backups diários (plano pago) ou manual

## 🔧 Passo 1: Obter Connection String

### 1.1 Acessar Supabase Dashboard

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** (⚙️) no menu lateral

### 1.2 Copiar DATABASE_URL

1. Clique em **Database** (na seção Settings)
2. Role até **Connection string**
3. Selecione **URI** (não Postgres)
4. Clique em **Copy** ou copie manualmente

A string será similar a:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE**:
- Substitua `[YOUR-PASSWORD]` pela senha do seu projeto
- Você definiu essa senha ao criar o projeto
- Se esqueceu, pode resetar em Settings → Database → Database Password

### 1.3 Formato Correto para Rails

A connection string deve estar neste formato:
```
postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Para Connection Pooling (Recomendado):**
Use a string com `pooler.supabase.com:6543` e `?pgbouncer=true`

**Para Conexão Direta:**
Use `db.xxxxxxxxxxxxx.supabase.co:5432`

## 🛠️ Passo 2: Configurar no Render

### 2.1 Adicionar DATABASE_URL

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Selecione seu Web Service `finance-app-api`
3. Vá em **Environment**
4. Adicione ou edite:
   ```
   DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Clique em **Save Changes**

### 2.2 Verificar Outras Variáveis

Certifique-se de que estas variáveis estão configuradas:
```bash
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
RAILS_MAX_THREADS=5
SECRET_KEY_BASE=[seu-secret-gerado]
JWT_SECRET_KEY=[seu-secret-gerado]
FRONTEND_URL=https://seu-app.vercel.app
```

## 🗄️ Passo 3: Executar Migrations

### 3.1 Via Render Deploy

O script `bin/render-build.sh` já executa automaticamente:
```bash
bundle exec rails db:migrate
```

Quando você fizer deploy, as migrations rodarão automaticamente.

### 3.2 Manualmente (se necessário)

Se precisar rodar migrations manualmente:

1. No Render Dashboard → seu service → **Shell**
2. Execute:
   ```bash
   bundle exec rails db:migrate
   ```

### 3.3 Localmente (para testar)

```bash
cd backend

# Configurar DATABASE_URL local
export DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Rodar migrations
bundle exec rails db:migrate

# Seed (opcional)
bundle exec rails db:seed
```

## 📊 Passo 4: Verificar no Supabase Dashboard

### 4.1 Ver Tabelas Criadas

1. Supabase Dashboard → **Table Editor**
2. Você deve ver as tabelas criadas pelas migrations:
   - users
   - accounts
   - categories
   - transactions
   - budgets
   - goals
   - etc.

### 4.2 SQL Editor

1. Vá em **SQL Editor**
2. Teste a conexão:
   ```sql
   SELECT COUNT(*) FROM users;
   ```

## 🔐 Passo 5: Segurança

### 5.1 Row Level Security (RLS)

O Supabase vem com RLS ativado por padrão. Para aplicação Rails API:

1. Desabilite RLS nas tabelas (Rails cuida da autorização):
   ```sql
   ALTER TABLE users DISABLE ROW LEVEL SECURITY;
   ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
   ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
   ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
   ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
   ALTER TABLE goals DISABLE ROW LEVEL SECURITY;
   ```

**OU** configure políticas RLS se quiser usar auth do Supabase.

### 5.2 Database Password

- Mantenha senha segura
- Não commite no git
- Use variável de ambiente
- Considere rotacionar periodicamente

### 5.3 Network Access

Supabase permite conexões de qualquer lugar por padrão.
Para maior segurança (plano pago):
- Configure IP whitelist
- Use connection pooling

## 📈 Passo 6: Monitoramento

### 6.1 Database Health

Supabase Dashboard → **Database** → **Health**
- CPU usage
- Memory usage
- Disk usage
- Connections

### 6.2 Logs

Supabase Dashboard → **Logs**
- API logs
- Database logs
- Auth logs
- Storage logs

### 6.3 SQL Queries

SQL Editor → **Query Performance**
- Slow queries
- Query statistics
- Indexes

## 🔄 Passo 7: Backups

### 7.1 Free Tier (Manual)

```bash
# Exportar database
pg_dump "postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" > backup-$(date +%Y%m%d).sql

# Restaurar
psql "postgresql://postgres.xxxxxxxxxxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < backup.sql
```

### 7.2 Pro Plan (Automático)

- Backups diários automáticos
- Point-in-time recovery
- 7 dias de retenção

## 🚀 Passo 8: Deploy

Agora pode fazer deploy normalmente:

```bash
git add .
git commit -m "chore: configure Supabase database"
git push origin master
```

GitHub Actions vai:
1. Rodar testes
2. Deploy no Render
3. Executar migrations no Supabase
4. Aplicação pronta! 🎉

## ✅ Checklist

- [ ] DATABASE_URL copiada do Supabase
- [ ] Senha substituída na connection string
- [ ] DATABASE_URL adicionada no Render
- [ ] Outras variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] Migrations executadas
- [ ] Tabelas verificadas no Supabase Dashboard
- [ ] RLS configurado (desabilitado ou com políticas)
- [ ] Health check funcionando: `/health`
- [ ] Aplicação testada

## 🐛 Troubleshooting

### Erro: "could not connect to server"
```
Solução:
1. Verifique se DATABASE_URL está correta
2. Confirme que a senha está correta
3. Use connection pooling URL (pooler.supabase.com)
```

### Erro: "SSL connection required"
```
Adicione ?sslmode=require à connection string:
postgresql://...postgres?pgbouncer=true&sslmode=require
```

### Migrations não rodam
```bash
# No Render Shell:
cd backend
bundle exec rails db:migrate RAILS_ENV=production

# Veja erros detalhados
bundle exec rails db:migrate:status
```

### Tabelas não aparecem no Dashboard
```
1. Atualize página do Supabase
2. Verifique schema: deve ser 'public'
3. SQL Editor: SELECT * FROM information_schema.tables;
```

### Performance lenta
```
1. Use connection pooling URL
2. Crie índices nas colunas mais consultadas
3. Analise queries no SQL Editor
```

## 📚 Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)
- [Database Backups](https://supabase.com/docs/guides/platform/backups)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

## 💡 Dicas

### Desenvolvimento Local
```bash
# .env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### Staging Environment
Crie um projeto Supabase separado para staging:
- `finance-app-staging`
- DATABASE_URL diferente
- Dados de teste

### Otimização
```sql
-- Criar índices importantes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);
```

## 🎉 Conclusão

Supabase configurado! Principais benefícios:

- ✅ Banco sempre ativo (não dorme)
- ✅ Gratuito até 500MB
- ✅ Dashboard visual para gerenciar dados
- ✅ Backups fáceis
- ✅ Performance global

Sua aplicação agora usa Supabase como database! 🚀
