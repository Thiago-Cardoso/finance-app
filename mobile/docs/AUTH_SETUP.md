# Sistema de Autenticação - Finance App Mobile

**Versão:** 1.0
**Data:** 2025-11-17
**Status:** ✅ Completo

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Segurança](#segurança)
5. [Uso](#uso)
6. [API Endpoints](#api-endpoints)

---

## Visão Geral

Sistema completo de autenticação com:
- ✅ Cadastro de usuário
- ✅ Login com email/senha
- ✅ Autenticação biométrica (Touch ID/Face ID)
- ✅ Recuperação de senha
- ✅ Armazenamento seguro de tokens (SecureStore)
- ✅ Refresh token automático
- ✅ Validação robusta com Zod
- ✅ Padrão MVVM

---

## Arquitetura

### Padrão MVVM

```
┌─────────────────────────┐
│         VIEWS           │
│  - Login.view.tsx       │
│  - Register.view.tsx    │
│  - ForgotPassword.view  │
└─────────────────────────┘
           ↕
┌─────────────────────────┐
│      VIEWMODEL          │
│  useAuth.viewModel.ts   │
└─────────────────────────┘
           ↕
┌─────────────────────────┐
│     MODEL/SERVICES      │
│  - auth.service.ts      │
│  - authStore.ts         │
│  - auth.schema.ts       │
└─────────────────────────┘
```

### Fluxo de Autenticação

```
1. User preenche formulário
   ↓
2. Validação com Zod
   ↓
3. Chamada à API (auth.service)
   ↓
4. API retorna { user, token, refresh_token }
   ↓
5. Token salvo em SecureStore (criptografado)
   ↓
6. User salvo em AsyncStorage
   ↓
7. Store atualizado (isAuthenticated = true)
   ↓
8. Navegação para tela principal
```

---

## Componentes

### 1. Auth Service

**Arquivo:** `src/shared/services/api/auth.service.ts`

Funções disponíveis:
```typescript
signUp(data: SignUpData): Promise<AuthResponse>
signIn(data: SignInData): Promise<AuthResponse>
signOut(): Promise<void>
forgotPassword(data: ForgotPasswordData): Promise<{ message: string }>
resetPassword(data: ResetPasswordData): Promise<{ message: string }>
getCurrentUser(): Promise<AuthResponse>
refreshAuthToken(refreshToken: string): Promise<{ token, refresh_token }>
```

### 2. Auth Store (Zustand)

**Arquivo:** `src/shared/stores/authStore.ts`

Estado:
```typescript
{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

Ações:
```typescript
setUser(user: User | null): void
setTokens(token: string, refreshToken: string): Promise<void>
clearTokens(): Promise<void>
login(user, token, refreshToken): Promise<void>
logout(): Promise<void>
loadUser(): Promise<void>
```

### 3. ViewModel

**Arquivo:** `src/viewModels/useAuth.viewModel.ts`

```typescript
const {
  user,                    // Usuário atual
  isAuthenticated,         // Se está autenticado
  isLoading,               // Loading state
  error,                   // Mensagem de erro
  handleSignIn,            // Login
  handleSignUp,            // Cadastro
  handleSignOut,           // Logout
  handleForgotPassword,    // Recuperar senha
  clearError,              // Limpar erro
} = useAuthViewModel();
```

### 4. Schemas de Validação

**Arquivo:** `src/shared/schemas/auth.schema.ts`

- `signUpSchema` - Cadastro
- `signInSchema` - Login
- `forgotPasswordSchema` - Recuperação
- `resetPasswordSchema` - Reset de senha

### 5. Hook de Biometria

**Arquivo:** `src/shared/hooks/useBiometric.ts`

```typescript
const {
  isBiometricSupported,   // Se dispositivo suporta
  isBiometricEnrolled,    // Se tem biometria cadastrada
  isBiometricEnabled,     // Se está habilitado no app
  biometricType,          // "Touch ID" ou "Face ID"
  authenticate,           // Autentica
  toggleBiometric,        // Ativa/desativa
  canUseBiometric,        // Se pode usar
} = useBiometric();
```

---

## Segurança

### Armazenamento de Tokens

⚠️ **CRÍTICO:** Tokens são armazenados de forma segura:

- **Tokens JWT:** SecureStore (criptografado) ✅
- **User data:** AsyncStorage (não sensível) ✅
- **NUNCA** armazenar tokens em AsyncStorage ❌

```typescript
// ✅ CORRETO
await SecureStore.setItemAsync('auth_token', token);

// ❌ ERRADO
await AsyncStorage.setItem('auth_token', token);
```

### Refresh Token Automático

O `apiClient` possui interceptor que:
1. Detecta erro 401 (token expirado)
2. Tenta refresh automático
3. Refaz a requisição original
4. Se falhar, faz logout e redireciona

### Timeout de Sessão

- **30 minutos** de inatividade
- Implementado no backend
- App faz logout automático ao detectar 401

---

## Uso

### Exemplo: Tela de Login

```typescript
import { LoginView } from '@/app/auth';

export function LoginScreen({ navigation }) {
  return (
    <LoginView
      onNavigateToRegister={() => navigation.navigate('Register')}
      onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
      onLoginSuccess={() => navigation.replace('Dashboard')}
    />
  );
}
```

### Exemplo: Verificar Autenticação

```typescript
import { useAuthStore } from '@/shared/stores/authStore';

function MyComponent() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Text>Por favor, faça login</Text>;
  }

  return <Text>Olá, {user?.first_name}!</Text>;
}
```

### Exemplo: Logout

```typescript
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';

function ProfileScreen() {
  const { handleSignOut } = useAuthViewModel();

  const onLogout = async () => {
    await handleSignOut();
    // Navegar para tela de login
  };

  return <Button title="Sair" onPress={onLogout} />;
}
```

### Exemplo: Biometria

```typescript
import { useBiometric } from '@/shared/hooks/useBiometric';

function SettingsScreen() {
  const { isBiometricEnrolled, isBiometricEnabled, toggleBiometric } = useBiometric();

  return (
    <Switch
      value={isBiometricEnabled}
      onValueChange={toggleBiometric}
      disabled={!isBiometricEnrolled}
    />
  );
}
```

---

## API Endpoints

### Base URL
- **Development:** `http://localhost:3000`
- **Production:** `https://api.finance-app.com`

### Endpoints

#### 1. Cadastro
```http
POST /api/v1/auth/sign_up
Content-Type: application/json

{
  "user": {
    "email": "usuario@example.com",
    "password": "Senha123",
    "password_confirmation": "Senha123",
    "first_name": "João",
    "last_name": "Silva"
  }
}

Response 201:
{
  "data": {
    "user": { "id": "1", "email": "...", ... },
    "token": "eyJhbGciOi...",
    "refresh_token": "abc123..."
  },
  "message": "Usuário criado com sucesso"
}
```

#### 2. Login
```http
POST /api/v1/auth/sign_in
Content-Type: application/json

{
  "user": {
    "email": "usuario@example.com",
    "password": "Senha123"
  }
}

Response 200:
{
  "data": {
    "user": { "id": "1", "email": "...", ... },
    "token": "eyJhbGciOi...",
    "refresh_token": "abc123..."
  },
  "message": "Login realizado com sucesso"
}
```

#### 3. Logout
```http
DELETE /api/v1/auth/sign_out
Authorization: Bearer {token}

Response 204: No Content
```

#### 4. Recuperar Senha
```http
POST /api/v1/auth/forgot_password
Content-Type: application/json

{
  "email": "usuario@example.com"
}

Response 200:
{
  "message": "E-mail de recuperação enviado"
}
```

#### 5. Reset de Senha
```http
POST /api/v1/auth/reset_password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "NovaSenha123",
  "password_confirmation": "NovaSenha123"
}

Response 200:
{
  "message": "Senha alterada com sucesso"
}
```

#### 6. Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "abc123..."
}

Response 200:
{
  "data": {
    "token": "new_jwt_token",
    "refresh_token": "new_refresh_token"
  }
}
```

#### 7. Usuário Atual
```http
GET /api/v1/auth/me
Authorization: Bearer {token}

Response 200:
{
  "data": {
    "user": { "id": "1", "email": "...", ... }
  }
}
```

---

## Validações

### Cadastro

- **Nome:** 2-50 caracteres, apenas letras
- **Sobrenome:** 2-50 caracteres, apenas letras
- **E-mail:** Formato válido
- **Senha:**
  - Mínimo 8 caracteres
  - Máximo 100 caracteres
  - Pelo menos 1 maiúscula
  - Pelo menos 1 minúscula
  - Pelo menos 1 número

### Login

- **E-mail:** Formato válido
- **Senha:** Obrigatória

---

## Estrutura de Arquivos

```
mobile/src/
├── app/auth/
│   ├── Login.view.tsx
│   ├── Register.view.tsx
│   ├── ForgotPassword.view.tsx
│   └── index.ts
│
├── viewModels/
│   └── useAuth.viewModel.ts
│
├── shared/
│   ├── services/api/
│   │   ├── client.ts
│   │   └── auth.service.ts
│   │
│   ├── stores/
│   │   └── authStore.ts
│   │
│   ├── schemas/
│   │   └── auth.schema.ts
│   │
│   ├── hooks/
│   │   └── useBiometric.ts
│   │
│   └── models/
│       └── User.model.ts
```

---

## Testes

Para testar a autenticação:

1. **Cadastro:**
   ```typescript
   const result = await handleSignUp({
     first_name: 'João',
     last_name: 'Silva',
     email: 'joao@example.com',
     password: 'Senha123',
     password_confirmation: 'Senha123',
   });
   ```

2. **Login:**
   ```typescript
   const result = await handleSignIn({
     email: 'joao@example.com',
     password: 'Senha123',
   });
   ```

3. **Biometria:**
   ```typescript
   const result = await authenticate('Faça login');
   if (result.success) {
     // Autenticado
   }
   ```

---

## Troubleshooting

### Erro: "Cannot find module 'expo-secure-store'"
```bash
npm install expo-secure-store --legacy-peer-deps
```

### Erro: "Cannot find module 'expo-local-authentication'"
```bash
npm install expo-local-authentication --legacy-peer-deps
```

### Biometria não funciona
- Verificar se o dispositivo suporta
- Verificar se há biometria cadastrada
- Testar em dispositivo real (não funciona em simulador)

### Token expira muito rápido
- Verificar configuração do backend (JWT expiration)
- Verificar se refresh token está funcionando

---

## Próximos Passos

- [ ] Adicionar testes unitários completos
- [ ] Implementar onboarding após primeiro login
- [ ] Adicionar autenticação social (Google, Apple)
- [ ] Melhorar tratamento de erros offline
- [ ] Adicionar analytics de autenticação

---

**Desenvolvido com ❤️ para Finance App**
**Última atualização:** 2025-11-17
**Versão:** 1.0
