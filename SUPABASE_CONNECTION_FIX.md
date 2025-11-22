# 🔧 Corrigir Erro de Conexão Supabase

## ❌ Erro Recebido
```
PG::ConnectionBad: connection to server at "44.216.29.125", port 6543 failed:
FATAL: Tenant or user not found
```

## 🎯 Causa do Problema

Este erro acontece quando:
1. A senha na connection string está incorreta
2. O formato da connection string está errado
3. Você está usando a porta errada (6543 vs 5432)
4. O projeto Supabase não está ativo

## ✅ Solução Passo a Passo

### 1️⃣ Obter a Connection String Correta

Vá ao Supabase Dashboard:

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Clique em **Settings** (⚙️) no menu lateral
4. Clique em **Database**
5. Role até **Connection string**
6. **IMPORTANTE**: Você verá 3 opções:

   - **URI** ← Use esta!
   - Postgres
   - JDBC

### 2️⃣ Escolher o Tipo Correto

Você verá 2 tipos de URI:

#### A) Connection Pooling (Recomendado para Produção) ✅
```
postgres://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Porta: `6543`
- Host: `*.pooler.supabase.com`
- Melhor para aplicações em produção
- Mais estável e performático

#### B) Direct Connection (Para debugging)
```
postgres://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```
- Porta: `5432`
- Host: `db.*.supabase.co`
- Conexão direta ao database

### 3️⃣ Substituir a Senha

**IMPORTANTE**: A connection string vem com `[YOUR-PASSWORD]` como placeholder!

**Como obter sua senha:**

#### Opção 1: Você salvou quando criou o projeto
- Use a senha que você definiu na criação

#### Opção 2: Resetar a senha
1. Supabase Dashboard → **Settings** → **Database**
2. Role até **Database Password**
3. Clique em **Reset Database Password**
4. Copie a nova senha (você só verá UMA VEZ!)
5. Clique em **Save**

**⚠️ ATENÇÃO**:
- Copie e salve a senha em lugar seguro
- Você não conseguirá ver a senha novamente
- Resetar a senha pode quebrar outras conexões ativas

### 4️⃣ Montar a Connection String Final

Exemplo com dados reais:

**String que você copiou:**
```
postgres://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Sua senha:** `MySecretPass123!`

**String final:**
```
postgres://postgres.abcdefghijklmnop:MySecretPass123!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**⚠️ IMPORTANTE**: Se sua senha tiver caracteres especiais (`@`, `:`, `/`, etc), você precisa fazer URL encoding:

| Caractere | Encoded |
|-----------|---------|
| @ | %40 |
| : | %3A |
| / | %2F |
| ? | %3F |
| # | %23 |
| [ | %5B |
| ] | %5D |
| ! | %21 |

Ou use este site: https://www.urlencoder.org/

### 5️⃣ Configurar no Render

1. Acesse: https://dashboard.render.com
2. Selecione seu Web Service: `finance-app-api`
3. Vá em **Environment**
4. Encontre a variável `DATABASE_URL`
5. **Edite** e cole a connection string completa com a senha
6. Clique em **Save Changes**
7. O Render vai fazer redeploy automático

### 6️⃣ Verificar a Connection String

Antes de salvar no Render, teste localmente:

```bash
# Teste a conexão
psql "postgres://postgres.xxxxxxxxxxxxx:SuaSenha@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Se conectar, você verá:
# postgres=>

# Teste uma query
\dt

# Sair
\q
```

**Se der erro "command not found: psql"**, instale:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client
```

## 🔍 Debugging Adicional

### Verificar qual connection string o Render está usando

1. Render Dashboard → seu service → **Shell**
2. Execute:
   ```bash
   echo $DATABASE_URL | sed 's/:[^@]*@/:***@/'
   ```
   (Isso mostra a URL sem expor a senha)

### Testar no Render diretamente

1. Render Dashboard → seu service → **Shell**
2. Execute:
   ```bash
   cd backend
   bundle exec rails runner "puts ActiveRecord::Base.connection.execute('SELECT 1').first"
   ```

Se funcionar, mostrará: `{"?column?"=>1}`

## ✅ Checklist de Verificação

- [ ] Connection string copiada do Supabase (Settings → Database)
- [ ] Tipo correto selecionado (URI, não Postgres ou JDBC)
- [ ] Senha substituída (removido `[YOUR-PASSWORD]`)
- [ ] Caracteres especiais da senha encodados (se necessário)
- [ ] Porta correta: 6543 (pooler) ou 5432 (direct)
- [ ] Host correto: `*.pooler.supabase.com` ou `db.*.supabase.co`
- [ ] `?pgbouncer=true` no final (se usar pooler)
- [ ] DATABASE_URL salva no Render Environment
- [ ] Redeploy iniciado

## 📊 Formatos Corretos

### ✅ CERTO - Connection Pooling
```
postgres://postgres.projectref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### ✅ CERTO - Direct Connection
```
postgres://postgres:password@db.projectref.supabase.co:5432/postgres
```

### ❌ ERRADO - Senha não substituída
```
postgres://postgres.projectref:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### ❌ ERRADO - Porta errada
```
postgres://postgres.projectref:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

### ❌ ERRADO - Formato postgresql:// em vez de postgres://
```
postgresql://postgres.projectref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```
(Ambos funcionam, mas Supabase usa `postgres://`)

## 🆘 Ainda não funciona?

### Teste 1: Verificar se o projeto está pausado
- Supabase Dashboard → Home
- Veja se há mensagem "Project paused"
- Clique em "Resume project"

### Teste 2: Criar nova senha
1. Supabase → Settings → Database
2. Reset Database Password
3. Salve a nova senha
4. Atualize DATABASE_URL no Render

### Teste 3: Usar conexão direta (temporariamente)
Troque para a connection string de porta 5432:
```
postgres://postgres:password@db.projectref.supabase.co:5432/postgres
```

### Teste 4: Verificar logs do Supabase
- Supabase Dashboard → Logs
- Veja se há tentativas de conexão falhadas

## 📞 Contato Supabase

Se nada funcionar:
1. Supabase Dashboard → Support
2. Ou: https://supabase.com/support
3. Discord: https://discord.supabase.com

## 🎯 Resolução Mais Comum

Em 90% dos casos, o problema é:
1. **Senha não substituída** na connection string
2. **Caracteres especiais** na senha não encodados
3. **Porta errada** (6543 vs 5432)

**Solução rápida:**
1. Resete a senha no Supabase (use uma senha simples sem caracteres especiais)
2. Copie a connection string novamente
3. Substitua `[YOUR-PASSWORD]` pela nova senha
4. Cole no Render
5. Save e aguarde redeploy

---

**Boa sorte!** 🚀 Se seguir estes passos, vai funcionar!
