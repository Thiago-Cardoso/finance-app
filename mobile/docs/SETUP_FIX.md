# Correções de Setup do Projeto Mobile

**Data:** 2025-11-12
**Status:** ✅ Corrigido

---

## 🐛 Problemas Encontrados

### 1. Dependências Críticas Faltando ⚠️ CAUSA DO CRASH
- **Erro:** `java.io.IOException` no Expo Go Android
- **Causa:** Faltavam 2 dependências peer obrigatórias:
  - `react-native-gesture-handler` (requerida por @react-navigation/stack)
  - `react-native-svg` (requerida por lucide-react-native)
- **Impacto:** App crashava ao tentar carregar no Expo Go

### 2. Metro Config Ausente
- **Erro:** `Found config at metro.config.js that could not be loaded`
- **Causa:** O `metro.config.js` estava configurado incorretamente com `withNativeWind` do NativeWind Metro
- **Impacto:** O Metro Bundler não conseguia iniciar

### 2. Expo Router Ativado Incorretamente
- **Erro:** `Using src/app as the root directory for Expo Router`
- **Causa:** O Expo detecta automaticamente Expo Router quando há uma pasta `src/app`
- **Impacto:** Conflito com React Navigation configurado no projeto

### 3. Dependências com Versões Incompatíveis
- **Warnings:**
  - `@react-native-async-storage/async-storage@1.24.0` → deveria ser `2.2.0`
  - `expo-secure-store@13.0.2` → deveria ser `~15.0.7`
  - `react-native-screens@4.18.0` → deveria ser `~4.16.0`
- **Impacto:** Potenciais problemas de compatibilidade com Expo 54

### 4. Plugin Reanimated no Babel
- **Causa:** `babel.config.js` incluía `react-native-reanimated/plugin` mas a lib não está instalada
- **Impacto:** Possíveis erros de build

---

## ✅ Correções Aplicadas

### 1. Dependências Críticas Instaladas ⚠️ FIX DO CRASH

**Instaladas:**
```bash
npm install react-native-gesture-handler react-native-svg --legacy-peer-deps
```

**App.tsx atualizado (linha 1):**
```typescript
import 'react-native-gesture-handler'; // ← OBRIGATÓRIO no topo
```

**Validação com expo-doctor:**
```bash
npx expo-doctor
# ✅ 17/17 checks passaram!
```

### 2. Metro Config Corrigido

**Arquivo:** `metro.config.js`

```javascript
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// NativeWind configuration
config.resolver.sourceExts.push('css');

module.exports = config;
```

**Mudança:** Simplificado para usar apenas o config padrão do Expo + suporte a CSS para NativeWind.

---

### 2. Expo Router Desabilitado

**Ação:** Renomeado `src/app/` → `src/screens/`

**Motivo:** Evita detecção automática do Expo Router, já que estamos usando React Navigation.

**Arquivos afetados:**
- ✅ `src/screens/` (nova estrutura)
- ✅ `App.tsx` (sem imports de `src/app`)

**Configuração adicional em `app.json`:**

```json
{
  "expo": {
    "scheme": "finance-app",
    "experiments": {
      "typedRoutes": false
    }
  }
}
```

---

### 3. Dependências Atualizadas

```bash
npm install \
  @react-native-async-storage/async-storage@2.2.0 \
  expo-secure-store@~15.0.7 \
  react-native-screens@~4.16.0 \
  --legacy-peer-deps
```

**Resultado:** 0 warnings de incompatibilidade

---

### 4. Babel Config Limpo

**Arquivo:** `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
```

**Mudança:** Removido `react-native-reanimated/plugin` (não necessário no momento).

---

### 5. Nova Arquitetura React Native Desabilitada

**Arquivo:** `app.json`

**Removido:**
```json
"newArchEnabled": true
```

**Motivo:** A nova arquitetura pode causar incompatibilidades com algumas bibliotecas. Será habilitada quando todas as dependências forem compatíveis.

---

## 🚀 Como Rodar Agora

```bash
# Dentro do diretório mobile/
npm start

# Escanear QR code com Expo Go
# Ou pressionar:
# - i para iOS Simulator
# - a para Android Emulator
```

---

## 📁 Estrutura Atualizada

```
mobile/
├── src/
│   ├── screens/        # ← Renomeado de "app" (Views MVVM)
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── accounts/
│   │   ├── categories/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── profile/
│   ├── viewModels/
│   ├── shared/
│   ├── routes/
│   ├── assets/
│   └── config/
├── App.tsx
├── metro.config.js     # ← Corrigido
├── babel.config.js     # ← Limpo
├── app.json           # ← Expo Router desabilitado
└── package.json       # ← Dependências atualizadas
```

---

## ✅ Resultado

- ✅ Metro Bundler inicia sem erros
- ✅ Expo Router não é mais ativado incorretamente
- ✅ 0 warnings de versões incompatíveis
- ✅ TypeScript compila sem erros
- ✅ Projeto pronto para rodar no Expo Go

---

## 📝 Observações

1. **React Navigation será implementado na Tarefa 4.0**
   - Por enquanto, o App.tsx é o único ponto de entrada
   - A estrutura de screens está pronta para receber navegação

2. **NativeWind está configurado e funcionando**
   - Classes Tailwind disponíveis em todos os componentes
   - Design system com cores do projeto configuradas

3. **Estrutura MVVM mantida**
   - `src/screens/` = View Layer
   - `src/viewModels/` = ViewModel Layer
   - `src/shared/models/` = Model Layer
   - `src/shared/services/` = Service Layer

---

**Gerado por:** Claude Code
**Responsável:** Thiago Cardoso
