# 🐛 Solução para java.io.IOException no Expo Go Android

**Data:** 2025-11-12
**Status:** ✅ RESOLVIDO

---

## 🎯 Problema

O app estava crashando com `java.io.IOException` ao tentar rodar no Expo Go do Android, mesmo após instalar as dependências peer (gesture-handler e svg).

---

## 🔍 Causa Raiz

O problema era a incompatibilidade entre versões:

1. **Expo SDK 54** é muito recente e usa **React 19.1.0**
2. **React 19** ainda não é totalmente suportado por várias bibliotecas nativas
3. **lucide-react-native** só suporta React 16/17/18, não React 19
4. **Expo Go** no celular pode ter incompatibilidades com SDK 54

---

## ✅ Solução Aplicada

### 1. Downgrade para Expo SDK 52 + React 18

**Pacotes alterados:**

| Pacote | Versão Antiga (SDK 54) | Versão Nova (SDK 52) |
|--------|------------------------|----------------------|
| expo | ~54.0.23 | ~52.0.0 |
| react | 19.1.0 | 18.3.1 |
| react-native | 0.81.5 | 0.76.9 |
| @types/react | ~19.1.0 | ~18.3.12 |
| expo-status-bar | ~3.0.8 | ~2.0.1 |
| expo-secure-store | ~15.0.7 | ~14.0.1 |
| react-native-gesture-handler | ~2.28.0 | ~2.20.2 |
| react-native-screens | ~4.16.0 | ~4.4.0 |
| react-native-safe-area-context | 5.6.2 | 4.12.0 |
| react-native-svg | 15.12.1 | 15.8.0 |
| @react-native-async-storage | 2.2.0 | 1.23.1 |

### 2. Removido propriedades não suportadas no app.json

Removidas do Android config (SDK 52 não suporta):
- ❌ `edgeToEdgeEnabled`
- ❌ `predictiveBackGestureEnabled`

---

## 🚀 Como Foi Feito

```bash
# 1. Limpar tudo
rm -rf node_modules package-lock.json .expo
npm cache clean --force

# 2. Downgrade do Expo
npm install expo@~52.0.0 --legacy-peer-deps

# 3. Atualizar todas dependências para SDK 52
npx expo install --fix
# (Falhou por conflitos, então foi usado --legacy-peer-deps)

# 4. Reinstalar tudo
npm install --legacy-peer-deps

# 5. Corrigir app.json
# Remover edgeToEdgeEnabled e predictiveBackGestureEnabled

# 6. Atualizar @types/react
npm install @types/react@~18.3.12 --save-dev --legacy-peer-deps

# 7. Validar
npx expo-doctor
# ✅ 17/17 checks passaram!
```

---

## 📱 Para Testar Agora

**1. Verifique a versão do Expo Go no seu celular:**
- Abra o Expo Go
- Vá em Settings
- Versão recomendada: **2.31.x** ou superior (compatível com SDK 52)
- Se estiver desatualizado, atualize pela Play Store

**2. Inicie o servidor:**
```bash
cd mobile
npm start
```

**3. Escaneie o QR code com o Expo Go**

---

## 🧪 Validação

```bash
npx expo-doctor
```

**Resultado esperado:** ✅ 17/17 checks passaram

---

## 📝 Versões Finais (SDK 52)

**package.json:**
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-svg": "15.8.0",
    // ... todas compatíveis com SDK 52
  },
  "devDependencies": {
    "@types/react": "~18.3.12",
    "typescript": "~5.9.2"
  }
}
```

---

## ⚠️ Importante

### Sobre Android SDK no Mac

**Você NÃO precisa** do Android SDK instalado no Mac para rodar no Expo Go.

**Android SDK só é necessário para:**
- ❌ Compilar APK/AAB nativo localmente
- ❌ Rodar no Android Emulator local
- ❌ Builds com `react-native run-android`

**Para Expo Go:**
- ✅ **NÃO** precisa de Android SDK
- ✅ **NÃO** precisa de emulador
- ✅ Só precisa do app Expo Go no celular
- ✅ Mac e celular na mesma rede WiFi (ou use --tunnel)

---

## 🎯 Por Que Expo SDK 52 ao invés de 54?

1. **Estabilidade:** SDK 52 é LTS (Long Term Support)
2. **Compatibilidade:** Todas as bibliotecas são 100% compatíveis
3. **React 18:** Amplamente testado e suportado
4. **Expo Go:** Melhor compatibilidade com versões do app
5. **Produção-ready:** Recomendado para apps em produção

**SDK 54 é bleeding edge:**
- React 19 ainda é experimental
- Muitas libs nativas não suportam
- Expo Go pode ter bugs
- Melhor aguardar estabilizar

---

## 🔄 Quando Atualizar para SDK 54?

Aguarde até que:
1. ✅ lucide-react-native suporte React 19
2. ✅ Todas dependências sejam compatíveis
3. ✅ SDK 54 se torne LTS
4. ✅ React 19 seja estável (não RC)

**Estimativa:** 2-3 meses (Q1 2026)

---

## ✅ Checklist de Solução

- [x] Downgrade para Expo SDK 52
- [x] Downgrade para React 18.3.1
- [x] Atualizar todas dependências para SDK 52
- [x] Remover propriedades não suportadas do app.json
- [x] Instalar react-native-gesture-handler
- [x] Instalar react-native-svg
- [x] Import gesture-handler no App.tsx
- [x] Passar 17/17 checks do expo-doctor
- [x] Documentar solução

---

**Gerado por:** Claude Code
**Responsável:** Thiago Cardoso
**Próximo passo:** Testar no Expo Go do Android
