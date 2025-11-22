# 🔧 Fix: DATABASE_URL para Render

## ❌ Problema Identificado

Sua `DATABASE_URL` local funciona, mas no Render dá erro:
```
PG::ConnectionBad: FATAL: Tenant or user not found
```

## 🎯 Causa

A string de conexão local está **quase correta**, mas faltam alguns detalhes para o Render:

**Sua string atual:**
```
postgresql://postgres.jgnyocjogvmcektxprpz:postgresdb182@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Problemas:**
1. ❌ Usa `postgresql://` em vez de `postgres://`
2. ❌ Falta `?pgbouncer=true` no final (importante para pooler)

## ✅ Solução

Use esta string no Render:

```
postgres://postgres.jgnyocjogvmcektxprpz:postgresdb182@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Mudanças:**
- ✅ `postgresql://` → `postgres://`
- ✅ Adicionado `?pgbouncer=true` no final

## 🚀 Como Configurar no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Selecione seu Web Service `finance-app-api`
3. Vá em **Environment**
4. Encontre ou adicione `DATABASE_URL`
5. Cole exatamente isto:
   ```
   postgres://postgres.jgnyocjogvmcektxprpz:postgresdb182@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. **Save Changes**
7. Aguarde redeploy automático

## 🔍 Por que isso acontece?

- **Localmente**: Ruby/Rails aceita ambos `postgresql://` e `postgres://`
- **No Render/Produção**: O pgbouncer (pooler) é mais rigoroso e precisa do formato exato
- O parâmetro `?pgbouncer=true` informa ao Supabase que você está usando connection pooling

## ✅ Verificação

Após configurar, o deploy deve funcionar e você verá nos logs:
```
== 20240101000000 CreateUsers: migrating ====
-- create_table(:users)
   -> 0.0234s
== 20240101000000 CreateUsers: migrated (0.0235s) ====
```

## 💡 Alternativa (se ainda não funcionar)

Se mesmo assim der erro, tente a conexão direta (porta 5432):

```
postgres://postgres.jgnyocjogvmcektxprpz:postgresdb182@db.jgnyocjogvmcektxprpz.supabase.co:5432/postgres
```

**Diferenças:**
- Host: `db.jgnyocjogvmcektxprpz.supabase.co` (direto ao database)
- Porta: `5432` (porta padrão PostgreSQL)
- Sem `?pgbouncer=true` (não usa pooler)

**Quando usar:**
- Connection pooling dá problema
- Debugging
- Temporariamente até resolver o pooler

## 📝 Atualizar .env local também (opcional)

Para manter consistência, atualize seu `.env` local para:

```bash
DATABASE_URL=postgres://postgres.jgnyocjogvmcektxprpz:postgresdb182@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Isso vai funcionar igualmente bem e mantém o mesmo formato de produção.

---

**Resumo:** Use `postgres://` (não `postgresql://`) e adicione `?pgbouncer=true`
