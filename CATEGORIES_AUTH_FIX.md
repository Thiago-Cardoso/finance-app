# Categories Authentication Fix

## 🔍 Problema Identificado

### Sintomas
- Erro 401 Unauthorized ao tentar criar/listar categorias
- Backend retornando: `{"success":false,"message":"Unauthorized","errors":[{"field":"authorization","message":"Invalid or missing token"}]}`

### Causa Raiz
O sistema de **autenticação ainda não foi implementado** (marcado como TODO para Task 6.0), mas o backend **exige autenticação JWT** para todos os endpoints de categorias:

```ruby
# backend/app/controllers/api/v1/categories_controller.rb
class Api::V1::CategoriesController < ApplicationController
  before_action :authenticate_user!  # ← Requer autenticação
  # ...
end
```

A página `/categories` no frontend estava acessível sem login, tentando fazer requisições sem token de autenticação.

## ✅ Solução Implementada

### 1. Proteção de Rota com Verificação de Auth

**Arquivo**: `frontend/src/app/categories/page.tsx`

Adicionei verificação de autenticação no início da página:

```typescript
export default function CategoriesPage() {
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()

  // Loading state enquanto verifica autenticação
  if (authLoading) {
    return <LoadingSpinner />
  }

  // Redireciona se não autenticado
  if (!token) {
    return <AuthRequiredMessage />
  }

  // Renderiza conteúdo protegido apenas se autenticado
  // ...
}
```

### 2. Mensagens de Erro Melhoradas

**Arquivo**: `frontend/src/hooks/useCategories.ts`

Adicionei tratamento específico para erros de autenticação:

```typescript
onError: (error: any) => {
  const message = error.message?.includes('401') || error.message?.includes('Unauthorized')
    ? 'Authentication required. Please log in.'
    : error.response?.data?.message || error.message || 'Failed to create category'
  toast.error(message)
}
```

### 3. Configuração do API Client

O `apiClient` já estava correto, pegando o token do localStorage:

```typescript
// frontend/src/lib/api.ts
const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

const config: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  },
}
```

## 🧪 Como Testar (Após Task 6.0)

### Quando a Autenticação Estiver Implementada:

1. **Fazer Login**
   ```typescript
   // Isso salvará o token no localStorage
   await login(email, password)
   ```

2. **Acessar Categorias**
   ```
   http://localhost:3000/categories
   ```

3. **Criar Categoria**
   - Clicar em "New Category"
   - Preencher formulário
   - Submit enviará com header: `Authorization: Bearer <token>`

### Teste Manual com Token Mock (TEMPORÁRIO):

Para testar agora (antes da Task 6.0), você pode adicionar um token fake:

```javascript
// No console do browser (F12)
localStorage.setItem('auth_token', 'mock-token-for-testing')
location.reload()
```

**⚠️ IMPORTANTE**: Isso ainda retornará 401 porque o backend valida o token JWT. É apenas para testar a UI.

## 📋 Checklist de Validação

- [x] Página `/categories` verifica autenticação
- [x] Usuário não autenticado vê mensagem clara
- [x] Botão "Go to Login" redireciona para `/`
- [x] Loading state durante verificação de auth
- [x] Mensagens de erro específicas para 401
- [x] API client envia token quando disponível
- [ ] **PENDENTE**: Implementar Task 6.0 (Autenticação completa)

## 🔄 Próximos Passos

1. **Task 6.0**: Implementar sistema de autenticação completo
   - Sign up / Sign in
   - JWT token handling
   - User session management
   - Protected routes middleware

2. **Após Task 6.0**:
   - Remover mensagem "Authentication Required"
   - Testar fluxo completo de autenticação → categorias
   - Validar refresh token
   - Testar logout e re-login

## 📊 Fluxo Atual vs Esperado

### Fluxo Atual (COM FIX):
```
User → /categories
  ↓
Verifica token no localStorage
  ↓
Sem token → Mostra "Authentication Required"
Com token → Tenta carregar categorias
  ↓
Backend valida token
  ↓
Token inválido → 401 → Toast error
Token válido → Retorna categorias
```

### Fluxo Esperado (Após Task 6.0):
```
User → /login → Autentica → Token salvo
  ↓
User → /categories → Token presente → Backend valida → Sucesso
```

## 🐛 Debug Tips

### Ver token atual:
```javascript
console.log(localStorage.getItem('auth_token'))
```

### Limpar token:
```javascript
localStorage.removeItem('auth_token')
```

### Ver requisições no Network tab:
1. Abrir DevTools (F12)
2. Network tab
3. Filtrar por "categories"
4. Ver Headers → Authorization

## 📝 Arquivos Modificados

1. ✅ `frontend/src/app/categories/page.tsx` - Adicionada verificação de auth
2. ✅ `frontend/src/hooks/useCategories.ts` - Melhorado tratamento de erro 401
3. ✅ `frontend/src/lib/api.ts` - JÁ ESTAVA CORRETO (token do localStorage)

---

**Status**: ✅ **RESOLVIDO** - Página protegida, aguardando Task 6.0 para autenticação completa
