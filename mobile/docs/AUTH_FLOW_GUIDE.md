# Guia do Fluxo de Autenticação - Mobile

## 📋 Visão Geral

Guia completo do fluxo de autenticação do app mobile, incluindo login com e sem biometria, navegação automática para o dashboard e persistência de sessão.

---

## 🎯 Fluxo Completo

### 1. Primeira Abertura do App

```
App Inicia
↓
Routes (Root Navigator)
↓
[Loading] Carregando user do AsyncStorage
↓
┌─────────────────────────────┐
│ Não autenticado?            │
│ → Vai para Auth Stack       │
│   (Tela de Login)           │
└─────────────────────────────┘
```

### 2. Fluxo de Login SEM Biometria

```
Login.view.tsx
↓
[Usuário preenche email e senha]
↓
[Clica em "Entrar"]
↓
useAuthViewModel.handleSignIn()
↓
authService.signIn() → API Call
↓
authStore.login(user, token, refreshToken)
  ├─ Salva tokens no SecureStore (criptografado)
  ├─ Salva user no AsyncStorage
  └─ Atualiza estado: isAuthenticated = true
↓
Routes detecta mudança de isAuthenticated
↓
Navega automaticamente para App Stack
↓
Dashboard.view.tsx (primeira tela do app)
```

### 3. Fluxo de Login COM Biometria

```
Login.view.tsx
↓
[Usuário clica no botão de biometria 👆]
↓
useBiometric.authenticate()
  ├─ iOS: Face ID / Touch ID
  └─ Android: Fingerprint / Face Unlock
↓
Biometria Aprovada ✅
↓
TODO: Buscar credenciais salvas
↓
handleSignIn() com credenciais salvas
↓
[Mesmo fluxo do login sem biometria]
```

**Nota:** Atualmente a biometria está implementada mas precisa ser conectada com as credenciais salvas.

### 4. App Já Autenticado

```
App Inicia
↓
Routes (Root Navigator)
↓
[Loading] useAuthStore.loadUser()
  ├─ Busca user no AsyncStorage
  ├─ Busca token no SecureStore
  └─ Se ambos existem: isAuthenticated = true
↓
Vai DIRETO para App Stack
↓
Dashboard.view.tsx ✅
```

### 5. Logout

```
Profile.view.tsx (ou qualquer tela)
↓
[Usuário clica em "Sair"]
↓
useAuthStore.logout()
  ├─ Remove tokens do SecureStore
  ├─ Remove user do AsyncStorage
  └─ Atualiza estado: isAuthenticated = false
↓
Routes detecta mudança
↓
Navega automaticamente para Auth Stack
↓
Login.view.tsx
```

---

## 🗂️ Estrutura de Arquivos

### Navegação

```
src/routes/
├── index.tsx           # Root Navigator (navegação condicional)
├── auth.routes.tsx     # Stack de Auth (Login, Register, ForgotPassword)
├── app.routes.tsx      # Bottom Tabs (Dashboard, Transactions, Reports, Profile)
└── types.ts           # TypeScript types para navegação
```

### Autenticação

```
src/
├── viewModels/
│   └── useAuth.viewModel.ts      # Lógica de auth (handleSignIn, handleSignUp)
├── shared/
│   ├── stores/
│   │   └── authStore.ts          # Zustand store (user, tokens, isAuthenticated)
│   ├── hooks/
│   │   └── useBiometric.ts       # Hook de biometria (authenticate)
│   └── services/
│       └── api/
│           └── auth.service.ts   # Chamadas API (signIn, signUp, logout)
└── app/
    └── auth/
        ├── Login.view.tsx        # Tela de Login
        ├── Register.view.tsx     # Tela de Cadastro
        └── ForgotPassword.view.tsx  # Tela de Recuperação
```

---

## 🔐 Segurança

### Armazenamento

**SecureStore (Criptografado)** ✅
- Token de autenticação
- Refresh token
- Credenciais biométricas (futuro)

**AsyncStorage (Não Criptografado)**
- Dados do usuário (nome, email)
- Preferências do app
- Não armazena senhas

### Biometria

**iOS:**
- Face ID
- Touch ID
- Configuração: `expo-local-authentication`

**Android:**
- Fingerprint
- Face Unlock
- Configuração: `expo-local-authentication`

**Permissões:**
```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Permitir uso de Face ID para login rápido"
        }
      ]
    ]
  }
}
```

---

## 🧪 Como Testar

### Teste 1: Login SEM Biometria

```bash
# 1. Limpar storage
npm run clean

# 2. Iniciar app
npm start

# 3. Abrir no device
npm run android  # ou npm run ios
```

**Passos:**
1. App abre na tela de Login ✅
2. Preencher:
   - Email: `teste@example.com`
   - Senha: `senha123`
3. Clicar em "Entrar"
4. **Resultado Esperado:** Navega automaticamente para Dashboard

### Teste 2: Login COM Biometria

**Pré-requisito:** Device real ou emulador com biometria configurada

**Passos:**
1. App abre na tela de Login
2. Clicar no botão de biometria 👆 (ícone de impressão digital)
3. Autenticar com Face ID / Touch ID / Fingerprint
4. **Resultado Esperado:** Atualmente apenas autentica, mas não faz login automaticamente
5. **TODO:** Implementar busca de credenciais salvas

### Teste 3: Persistência de Sessão

**Passos:**
1. Fazer login normalmente
2. App navega para Dashboard
3. **Fechar o app completamente**
4. Abrir o app novamente
5. **Resultado Esperado:** App abre DIRETO no Dashboard (sem pedir login)

### Teste 4: Logout

**Passos:**
1. Estar logado no app (Dashboard visível)
2. Ir para Profile (última tab)
3. Clicar em "Sair" / "Logout"
4. **Resultado Esperado:** Volta para tela de Login

---

## 🐛 Troubleshooting

### Problema 1: App abre em tela branca

**Causa:** App.tsx não está usando Routes

**Solução:**
```bash
# Verificar App.tsx
cat App.tsx

# Deve conter:
import { Routes } from './src/routes';
```

### Problema 2: Não navega para Dashboard após login

**Causa:** authStore não está atualizando isAuthenticated

**Debug:**
```typescript
// src/viewModels/useAuth.viewModel.ts
const handleSignIn = async (data: SignInFormData) => {
  console.log('Login iniciado');
  const response = await authService.signIn(data);
  console.log('API response:', response);

  await login(user, token, refreshToken);
  console.log('authStore.login chamado');

  // Verificar estado
  console.log('isAuthenticated:', useAuthStore.getState().isAuthenticated);
};
```

### Problema 3: Biometria não funciona

**iOS - Face ID:**
```xml
<!-- Info.plist -->
<key>NSFaceIDUsageDescription</key>
<string>Usar Face ID para login rápido</string>
```

**Android - Fingerprint:**
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

**Verificar disponibilidade:**
```typescript
const { canUseBiometric, biometricType } = useBiometric();
console.log('Biometria disponível?', canUseBiometric);
console.log('Tipo:', biometricType);
```

### Problema 4: Sessão não persiste (sempre pede login)

**Causa:** AsyncStorage ou SecureStore não está salvando

**Debug:**
```typescript
// Verificar storage
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const debugStorage = async () => {
  const user = await AsyncStorage.getItem('@finance-app:user');
  const token = await SecureStore.getItemAsync('auth_token');

  console.log('User saved:', !!user);
  console.log('Token saved:', !!token);
};
```

---

## 📊 Estado da Autenticação

### authStore State

```typescript
{
  user: User | null,              // Dados do usuário
  isAuthenticated: boolean,       // true se logado
  isLoading: boolean,            // true durante loadUser()
}
```

### Checklist de Autenticação

**Usuário Autenticado:**
- ✅ `user` não é null
- ✅ `isAuthenticated` é true
- ✅ Token existe no SecureStore
- ✅ App mostra App Stack (Dashboard)

**Usuário NÃO Autenticado:**
- ❌ `user` é null
- ❌ `isAuthenticated` é false
- ❌ Sem token no SecureStore
- ❌ App mostra Auth Stack (Login)

---

## 🚀 Próximos Passos

### Implementar Login com Biometria Completo

**Passo 1:** Salvar credenciais após login bem-sucedido
```typescript
// src/viewModels/useAuth.viewModel.ts
const handleSignIn = async (data: SignInFormData) => {
  const result = await authService.signIn(data);

  // Salvar login
  await login(result.user, result.token, result.refreshToken);

  // Perguntar se quer salvar para biometria
  if (canUseBiometric) {
    Alert.alert(
      'Habilitar Biometria?',
      `Usar ${biometricType} para login rápido?`,
      [
        { text: 'Não' },
        {
          text: 'Sim',
          onPress: async () => {
            await SecureStore.setItemAsync('biometric_email', data.email);
            await SecureStore.setItemAsync('biometric_password', data.password);
          }
        }
      ]
    );
  }
};
```

**Passo 2:** Buscar credenciais na autenticação biométrica
```typescript
// src/app/auth/Login.view.tsx
const handleBiometricAuth = async () => {
  const result = await authenticate('Login com biometria');

  if (result.success) {
    // Buscar credenciais salvas
    const email = await SecureStore.getItemAsync('biometric_email');
    const password = await SecureStore.getItemAsync('biometric_password');

    if (email && password) {
      // Fazer login automático
      await handleSignIn({ email, password });
    }
  }
};
```

### Implementar Refresh Token

**Interceptor do Axios:**
```typescript
// src/shared/services/api/client.ts
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expirado, tentar refresh
      const refreshToken = await SecureStore.getItemAsync('refresh_token');

      if (refreshToken) {
        // Chamar endpoint de refresh
        // Atualizar tokens
        // Retry request original
      }
    }
    return Promise.reject(error);
  }
);
```

---

## ✅ Checklist de Implementação

- [x] Routes configuradas (Auth Stack + App Stack)
- [x] App.tsx usando Routes
- [x] authStore implementado (Zustand + SecureStore)
- [x] Login sem biometria funcionando
- [x] Navegação automática para Dashboard após login
- [x] Persistência de sessão (AsyncStorage + SecureStore)
- [x] Logout funcionando
- [x] Hook useBiometric implementado
- [ ] Salvar credenciais para biometria (TODO)
- [ ] Login automático com biometria (TODO)
- [ ] Refresh token automático (TODO)
- [ ] Tratamento de erros de rede (TODO)

---

**Última Atualização:** 2025-11-18
**Status:** ✅ Fluxo Base Implementado
**Biometria:** Parcial (autentica mas não faz login automático)
**Navegação:** Funcionando (Login → Dashboard)
