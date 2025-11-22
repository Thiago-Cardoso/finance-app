# Finance App Mobile - MVP

Aplicativo mobile de controle financeiro pessoal construído com React Native e Expo.

## 📱 Stack Tecnológica

- **React Native:** 0.82.0
- **Expo SDK:** 54.0.0
- **TypeScript:** 5.3+
- **NativeWind:** 4.2.0 (Tailwind CSS)
- **Arquitetura:** MVVM (Model-View-ViewModel)

### Principais Dependências

- **Navegação:** React Navigation 6.x
- **State Management:** Zustand 4.5.0
- **Validação:** Zod 3.22.0
- **Forms:** React Hook Form 7.48.0
- **HTTP Client:** Axios 1.6.0
- **Gráficos:** Victory Native 37.0.0
- **Ícones:** Lucide React Native

## 🚀 Setup do Projeto

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Expo Go app (iOS/Android) para testes

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start

# Rodar no iOS
npm run ios

# Rodar no Android
npm run android

# Rodar no navegador (web)
npm run web
```

### Variáveis de Ambiente

Copie `.env.example` para `.env.development` e configure:

```bash
cp .env.example .env.development
```

Variáveis disponíveis:
- `EXPO_PUBLIC_API_URL`: URL da API backend
- `EXPO_PUBLIC_API_VERSION`: Versão da API (v1)
- `EXPO_PUBLIC_ENV`: Ambiente (development/production)

## 📁 Estrutura do Projeto (MVVM)

```
mobile/
├── src/
│   ├── app/                    # VIEW LAYER - Telas
│   │   ├── auth/              # Autenticação
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── transactions/      # Transações
│   │   ├── accounts/          # Contas
│   │   ├── categories/        # Categorias
│   │   ├── budgets/           # Orçamentos
│   │   ├── reports/           # Relatórios
│   │   └── profile/           # Perfil
│   │
│   ├── viewModels/            # VIEWMODEL LAYER - Lógica de apresentação
│   │
│   ├── shared/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── ui/           # Button, Input, Card, etc.
│   │   │   ├── charts/       # Gráficos
│   │   │   └── layout/       # Layout components
│   │   │
│   │   ├── services/         # SERVICE LAYER
│   │   │   ├── api/         # API clients
│   │   │   ├── storage/     # AsyncStorage, SecureStore
│   │   │   └── notifications/
│   │   │
│   │   ├── models/           # MODEL LAYER - Tipos TypeScript
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── stores/           # Zustand stores
│   │   ├── hooks/            # Custom hooks
│   │   ├── utils/            # Utilities
│   │   └── constants/        # Constantes
│   │
│   ├── routes/               # Navegação
│   ├── assets/               # Imagens, ícones, fontes
│   └── config/               # Configurações
│
├── App.tsx                   # Entry point
├── global.css               # Tailwind imports
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## 🎨 Design System

O projeto usa NativeWind (Tailwind CSS) com as cores do design system:

- **Primary:** `#5843BE` (Roxo)
- **Secondary:** `#3B82F6` (Azul)
- **Success:** `#10B981` (Verde)
- **Error:** `#EF4444` (Vermelho)
- **Warning:** `#F59E0B` (Amarelo)

### Uso de Classes Tailwind

```tsx
<View className="flex-1 bg-primary p-4">
  <Text className="text-xl font-bold text-white">
    Hello World
  </Text>
</View>
```

## 🧪 Testes

```bash
# Rodar testes unitários
npm test

# Cobertura de testes
npm run test:coverage

# Testes E2E (Detox)
npm run test:e2e
```

## 📦 Build e Deploy

### EAS Build (Expo Application Services)

```bash
# Login no Expo
eas login

# Configurar EAS
eas build:configure

# Build para desenvolvimento
eas build --platform ios --profile development
eas build --platform android --profile development

# Build para produção
eas build --platform all --profile production
```

## 🔗 Integração com Backend

O app mobile consome a API Rails existente:

- **Base URL:** `http://localhost:3000` (dev) ou `https://api.finance-app.com` (prod)
- **API Version:** v1
- **Autenticação:** JWT Bearer Token
- **46 endpoints** mapeados na [Tech Spec](../tasks/prd-mobile-app-mvp/tech-spec.md)

## 📚 Documentação

- [PRD - Product Requirement Document](../tasks/prd-mobile-app-mvp/prd.md)
- [Tech Spec - Especificação Técnica](../tasks/prd-mobile-app-mvp/tech-spec.md)
- [Arquitetura Mobile](../architectural-mobile.md)
- [Tarefas do Projeto](../tasks/prd-mobile-app-mvp/tasks/tasks.md)

## 🤝 Contribuindo

Leia o [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão de pull requests.

## 📄 Licença

Este projeto é privado e proprietário.

---

**Status:** ✅ Setup concluído - Pronto para desenvolvimento!
**Versão:** 1.0.0
**Última atualização:** 2025-11-11
