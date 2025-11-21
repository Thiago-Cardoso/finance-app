# Expo - Troubleshooting de Hot Reload

## 🔥 Problema: App não atualiza no emulador iOS

Quando o Expo não reflete as mudanças no código, siga estes passos:

---

## ✅ Solução Rápida

### Opção 1: Start com Cache Limpo
```bash
npm run ios:clear
```

### Opção 2: Limpeza Manual Completa
```bash
# 1. Limpar cache
npm run clean

# 2. Start com --clear
npm run ios:clear
```

### Opção 3: Reset Total (casos extremos)
```bash
# 1. Limpar tudo
rm -rf .expo node_modules/.cache ios/build

# 2. Reinstalar dependências
npm run clean:full

# 3. Start limpo
npm run ios:clear
```

---

## 🔧 Comandos Disponíveis

```bash
npm run ios              # Start iOS normal
npm run ios:clear        # Start iOS com cache limpo ✅ RECOMENDADO

npm run android          # Start Android normal
npm run android:clear    # Start Android com cache limpo

npm run start:clear      # Start sem abrir emulador
npm run clean            # Limpa cache Metro + Expo
npm run clean:full       # Limpa tudo + reinstala
```

---

## 🐛 Problemas Comuns

### 1. Mudanças não aparecem

**Sintomas:**
- Editar código
- Salvar arquivo
- Emulador não atualiza

**Solução:**
```bash
# No terminal onde o Expo está rodando:
# Pressione 'r' para reload manual

# Ou reiniciar com cache limpo:
npm run ios:clear
```

---

### 2. "Unable to resolve module"

**Sintomas:**
```
Error: Unable to resolve module @/shared/types/analytics
```

**Solução:**
```bash
# 1. Verificar symlinks
npm run verify:symlinks

# 2. Limpar cache
npm run clean

# 3. Reiniciar
npm run ios:clear
```

---

### 3. Tela branca após mudanças

**Sintomas:**
- App carrega mas mostra tela branca
- Erro no console do Expo

**Solução:**
```bash
# 1. Verificar erros no terminal
# Procure por erros de import ou TypeScript

# 2. No Expo DevTools (navegador):
# Clicar em "Reload" ou pressionar 'r'

# 3. Se persistir:
npm run ios:clear
```

---

### 4. Metro Bundler não inicia

**Sintomas:**
```
Error: EADDRINUSE: address already in use :::8081
```

**Solução:**
```bash
# Matar processo na porta 8081
lsof -ti:8081 | xargs kill -9

# Iniciar novamente
npm run ios:clear
```

---

### 5. Symlinks não funcionam

**Sintomas:**
- Imports de `@/shared/types/...` falham
- "Module not found"

**Solução:**
```bash
# 1. Verificar symlinks existem
ls -la src/shared/types
ls -la src/shared/utils/formatters.ts
ls -la src/shared/lib/validations.ts

# 2. Recriar se necessário
cd src/shared
rm -rf types
ln -s ../../../frontend/src/types types

# 3. Limpar cache e reiniciar
npm run clean
npm run ios:clear
```

---

## 🎯 Checklist de Debug

Quando algo não funciona, seguir esta ordem:

- [ ] **1. Reload Manual**
  ```bash
  # No terminal do Expo, pressionar 'r'
  ```

- [ ] **2. Verificar Erros**
  ```bash
  # Ler output do terminal
  # Procurar por erros de import/TypeScript
  ```

- [ ] **3. Limpar Cache**
  ```bash
  npm run clean
  ```

- [ ] **4. Start com --clear**
  ```bash
  npm run ios:clear
  ```

- [ ] **5. Verificar Symlinks**
  ```bash
  npm run verify:symlinks
  ```

- [ ] **6. Reset Completo** (último recurso)
  ```bash
  npm run clean:full
  npm run ios:clear
  ```

---

## ⌨️ Atalhos do Expo

Quando o Expo está rodando, você pode usar:

```
r - Reload do app
m - Toggle menu
d - Abrir DevTools no navegador
i - Abrir no iOS simulator
a - Abrir no Android emulator
c - Limpar cache do Metro
q - Quit (sair do Expo)
```

---

## 🔄 Fast Refresh vs Full Reload

### Fast Refresh (Automático)
- Acontece ao salvar arquivo
- Mantém estado do componente
- **Nem sempre funciona com:**
  - Mudanças em navigation
  - Novos symlinks
  - Alterações em App.tsx
  - Mudanças em stores (Zustand)

### Full Reload (Manual)
```bash
# Método 1: Pressionar 'r' no terminal
r

# Método 2: Shake no device real
# Shake físico ou Cmd+D no simulator

# Método 3: No código
import { DevSettings } from 'react-native';
DevSettings.reload();
```

---

## 📱 Emulador iOS Específico

### Limpar App do Emulador
```bash
# Device → Erase All Content and Settings
# Ou via terminal:
xcrun simctl erase all
```

### Reset Simulator
```bash
# 1. Fechar simulator
# 2. Limpar cache
rm -rf ~/Library/Developer/Xcode/DerivedData

# 3. Reiniciar
npm run ios:clear
```

### Reinstalar App no Simulator
```bash
# 1. Deletar app do simulator
# (long press no ícone → Delete)

# 2. Reinstalar
npm run ios:clear
```

---

## 🚀 Performance do Metro

### Se o Metro está lento:

```bash
# 1. Limpar cache
npm run clean

# 2. Desabilitar minificação em dev
# metro.config.js
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  compress: false,  // Desabilita minify
};

# 3. Aumentar watchers (se necessário)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 📊 Logs Úteis

### Ver logs do Metro
```bash
# Terminal mostra automaticamente
# Ou ativar debug:
npm run debug:metro
```

### Ver logs do iOS Simulator
```bash
# Instalar ios-deploy
npm install -g ios-deploy

# Ver logs
ios-deploy --debug
```

### Ver network requests
```bash
# Instalar Reactotron (opcional)
npm install --save-dev reactotron-react-native

# Ver requests no DevTools do Expo
# Pressionar 'd' no terminal
```

---

## 🆘 Último Recurso

Se NADA funcionar:

```bash
# 1. Fechar TUDO
# - Fechar Expo CLI
# - Fechar simulador iOS
# - Fechar VSCode

# 2. Limpar TUDO
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData

# 3. Reinstalar
npm install

# 4. Start limpo
npm run ios:clear

# 5. Se ainda não funcionar, reiniciar o Mac
sudo reboot
```

---

## ✅ Solução Mais Comum

**90% dos problemas são resolvidos com:**

```bash
npm run ios:clear
```

**Pressione 'r' no terminal do Expo quando fizer mudanças!**

---

**Última Atualização:** 2025-11-18
**Expo SDK:** 54.0.0
**React Native:** 0.81.5
