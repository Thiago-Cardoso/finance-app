# PRD: Aplicativo Mobile de Controle Financeiro Pessoal (MVP)

**Versão:** 1.0
**Data:** 2025-11-10
**Autor:** Thiago Cardoso (com apoio de Claude Code)
**Status:** Aprovado para Desenvolvimento

---

## 1. Resumo Executivo

### 1.1 Visão Geral

Este PRD define os requisitos para o MVP (Minimum Viable Product) de um aplicativo mobile de controle financeiro pessoal, construído com React Native e Expo. O aplicativo permitirá que usuários gerenciem suas finanças de forma intuitiva, acompanhem gastos, definam orçamentos e visualizem relatórios financeiros consolidados.

### 1.2 Objetivos do Produto

- **Objetivo Primário:** Oferecer uma solução mobile intuitiva para controle financeiro pessoal que permita registro rápido de transações e visualização clara de dados financeiros
- **Objetivo Secundário:** Criar uma base sólida e escalável para futuras funcionalidades premium (OCR, análise preditiva, integrações bancárias)
- **Objetivo de Negócio:** Atingir 10.000 usuários ativos em 6 meses com taxa de retenção de 40% após 90 dias

### 1.3 Métricas de Sucesso (KPIs)

| Métrica | Meta MVP | Período |
|---------|----------|---------|
| Tempo para registrar transação | < 30 segundos | Por transação |
| Taxa de adoção do app | 40% dos cadastros | 90 dias |
| Engagement diário | 60% dos usuários ativos | Diário |
| Taxa de conclusão do onboarding | > 75% | Por sessão |
| Crash-free rate | > 99% | Mensal |
| App Store Rating | > 4.0 estrelas | Contínuo |

---

## 2. Contexto e Problema

### 2.1 Problema a Resolver

**Problema Principal:** Adultos de 25-45 anos têm dificuldade em manter controle financeiro consistente devido à falta de ferramentas simples, rápidas e intuitivas que se integrem naturalmente ao seu dia a dia mobile.

**Dores Identificadas:**
- Planilhas manuais são trabalhosas e pouco práticas no mobile
- Apps existentes são complexos demais ou carecem de funcionalidades essenciais
- Falta de visibilidade consolidada sobre a saúde financeira
- Dificuldade em manter disciplina de registro de gastos

### 2.2 Público-Alvo

**Persona Primária: "Ana, a Profissional Organizada"**
- **Idade:** 28-35 anos
- **Ocupação:** Profissional liberal ou CLT
- **Renda:** R$ 3.000 - R$ 8.000/mês
- **Comportamento:** Usa smartphone como ferramenta principal, busca organização financeira, mas não tem tempo para sistemas complexos
- **Objetivos:** Saber para onde vai seu dinheiro, economizar para objetivos de médio prazo, evitar surpresas no fim do mês

**Persona Secundária: "Carlos, o Empreendedor Digital"**
- **Idade:** 25-40 anos
- **Ocupação:** Autônomo/Freelancer
- **Renda:** Variável (R$ 2.000 - R$ 15.000/mês)
- **Comportamento:** Alta adoção tecnológica, renda irregular, precisa separar finanças pessoais de profissionais
- **Objetivos:** Controlar fluxo de caixa, planejar impostos, criar reserva de emergência

### 2.3 Contexto de Mercado

- Mercado brasileiro de fintechs crescendo 30% ao ano
- 78% dos brasileiros usam smartphone como dispositivo principal
- Apps de finanças pessoais têm baixa retenção (média 25% após 3 meses)
- Oportunidade de diferenciação via UX simplificada e foco mobile-first

---

## 3. Escopo do MVP

### 3.1 Funcionalidades Incluídas (In Scope)

#### RF01 - Autenticação e Onboarding
**Prioridade:** P0 (Crítica)

- **RF01.1** - Cadastro de usuário com email e senha
- **RF01.2** - Login com email/senha e biometria (Touch ID/Face ID)
- **RF01.3** - Recuperação de senha via email
- **RF01.4** - Fluxo de onboarding inicial (3-4 telas) explicando funcionalidades principais
- **RF01.5** - Configuração inicial: moeda padrão (BRL), categorias favoritas

**Critérios de Aceite:**
- Cadastro completo em menos de 2 minutos
- Login com biometria funcional em iOS 13+ e Android 10+
- Validação de email no backend
- Onboarding pode ser pulado e revisitado

#### RF02 - Dashboard Principal
**Prioridade:** P0 (Crítica)

- **RF02.1** - Visualização de saldo consolidado (todas as contas)
- **RF02.2** - Resumo do mês atual: receitas, despesas, saldo líquido
- **RF02.3** - Gráfico de despesas por categoria (pizza ou barra)
- **RF02.4** - Últimas 5 transações registradas
- **RF02.5** - Indicador de progresso do orçamento mensal
- **RF02.6** - Pull-to-refresh para atualizar dados

**Critérios de Aceite:**
- Dashboard carrega em menos de 2 segundos
- Valores atualizados em tempo real após nova transação
- Gráficos responsivos e interativos (tap para detalhes)
- Suporte a modo claro e escuro

#### RF03 - Registro de Transações
**Prioridade:** P0 (Crítica)

- **RF03.1** - Adicionar transação rápida via FAB (Floating Action Button)
- **RF03.2** - Campos: tipo (receita/despesa), valor, categoria, conta, data, descrição (opcional)
- **RF03.3** - Seletor de categoria com ícones visuais
- **RF03.4** - Seletor de data (padrão: hoje)
- **RF03.5** - Validação de campos obrigatórios
- **RF03.6** - Confirmação visual após salvar transação
- **RF03.7** - Edição e exclusão de transações existentes

**Critérios de Aceite:**
- Transação completa registrada em menos de 30 segundos
- Formulário com validação inline (feedback imediato)
- Suporte a valores decimais com 2 casas
- Histórico de transações acessível via lista paginada

#### RF04 - Contas e Categorias
**Prioridade:** P0 (Crítica)

- **RF04.1** - Criar, editar e excluir contas (ex: Carteira, Banco Inter, Nubank)
- **RF04.2** - Definir saldo inicial para cada conta
- **RF04.3** - Categorias pré-definidas (Alimentação, Transporte, Moradia, Lazer, etc.)
- **RF04.4** - Criar categorias personalizadas
- **RF04.5** - Atribuir ícone e cor para cada categoria/conta

**Critérios de Aceite:**
- Mínimo 10 categorias pré-definidas
- Suporte a até 20 contas simultâneas
- Exclusão de conta com transações existentes mostra aviso
- Ícones customizados carregam da biblioteca Lucide Icons

#### RF05 - Orçamentos
**Prioridade:** P1 (Alta)

- **RF05.1** - Definir orçamento mensal por categoria
- **RF05.2** - Visualizar progresso do orçamento (% usado)
- **RF05.3** - Alerta visual quando orçamento atingir 80% e 100%
- **RF05.4** - Histórico de orçamentos de meses anteriores

**Critérios de Aceite:**
- Progresso atualizado em tempo real
- Alertas discretos (não intrusivos)
- Suporte a orçamento total e por categoria

#### RF06 - Relatórios Básicos
**Prioridade:** P1 (Alta)

- **RF06.1** - Relatório mensal: receitas vs despesas
- **RF06.2** - Gráfico de evolução de saldo (linha do tempo)
- **RF06.3** - Ranking de categorias com maior gasto
- **RF06.4** - Filtros: período (mês/trimestre/ano), tipo, categoria

**Critérios de Aceite:**
- Gráficos renderizam com Victory Native
- Exportação de dados não incluída no MVP
- Dados persistidos localmente (AsyncStorage/SQLite)

#### RF07 - Perfil e Configurações
**Prioridade:** P2 (Média)

- **RF07.1** - Visualizar e editar dados do perfil
- **RF07.2** - Alternar entre modo claro/escuro
- **RF07.3** - Alterar senha
- **RF07.4** - Fazer logout
- **RF07.5** - Sobre o app (versão, termos, privacidade)

**Critérios de Aceite:**
- Preferência de tema persistida
- Links externos abrem no navegador nativo

#### RF08 - Notificações Push (Básicas)
**Prioridade:** P2 (Média)

- **RF08.1** - Notificação diária lembrando de registrar gastos (opt-in)
- **RF08.2** - Notificação quando orçamento atinge 80%
- **RF08.3** - Configurações de notificações (ativar/desativar)

**Critérios de Aceite:**
- Usuário controla permissões
- Notificações locais (não requerem backend complexo)

### 3.2 Funcionalidades Excluídas (Out of Scope)

**Versão Futura (Pós-MVP):**
- ❌ OCR para leitura de recibos e notas fiscais
- ❌ Modo offline robusto com sincronização
- ❌ Widgets de tela inicial (iOS/Android)
- ❌ Integrações bancárias (Open Finance)
- ❌ Análise preditiva com IA
- ❌ Compartilhamento de orçamentos (multi-usuário)
- ❌ Exportação de dados (CSV/PDF)
- ❌ Geolocalização de gastos
- ❌ Metas de economia com gamificação
- ❌ Apple Watch / Wear OS

---

## 4. Arquitetura e Stack Tecnológica

### 4.1 Stack Mobile

#### Framework e Linguagem
- **React Native:** 0.82.0
- **Expo SDK:** 54.0.0
- **TypeScript:** 5.3+
- **Padrão Arquitetural:** MVVM (Model-View-ViewModel)

#### Estilização e UI
- **NativeWind:** 4.2.0 (Tailwind CSS para React Native)
- **Biblioteca de Ícones:** Lucide React Native
- **Gráficos:** Victory Native

#### Navegação
- **React Navigation:** 6.x
  - Stack Navigator (fluxos principais)
  - Bottom Tabs Navigator (navegação principal)

#### Gerenciamento de Estado
- **Zustand:** State management leve e escalável
- **React Context API:** Autenticação e temas

#### Validação
- **Zod:** Validação de schemas (consistente com frontend web)

#### Persistência Local
- **AsyncStorage:** Preferências do usuário
- **Expo SQLite:** Dados estruturados (transações, contas, categorias)

#### Autenticação
- **Expo Local Authentication:** Biometria (Touch ID/Face ID)
- **JWT:** Tokens de autenticação (backend Rails)

#### Notificações
- **Expo Notifications:** Push notifications locais e remotas

#### Formulários
- **React Hook Form:** Gerenciamento eficiente de formulários

### 4.2 Integração Backend

**API REST:** Rails backend existente
- **Base URL:** `https://api.finance-app.com` (produção)
- **Autenticação:** Bearer Token (JWT)
- **Endpoints Principais:**
  - `POST /api/v1/auth/register` - Cadastro
  - `POST /api/v1/auth/login` - Login
  - `GET /api/v1/transactions` - Listar transações
  - `POST /api/v1/transactions` - Criar transação
  - `GET /api/v1/accounts` - Listar contas
  - `GET /api/v1/budgets` - Orçamentos

### 4.3 Estrutura de Diretórios (MVVM)

```
mobile/
├── src/
│   ├── app/                    # Views (telas)
│   │   ├── auth/
│   │   │   ├── Login.view.tsx
│   │   │   ├── Register.view.tsx
│   │   │   └── components/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.view.tsx
│   │   │   └── components/
│   │   ├── transactions/
│   │   │   ├── TransactionForm.view.tsx
│   │   │   ├── TransactionList.view.tsx
│   │   │   └── components/
│   │   ├── budgets/
│   │   ├── reports/
│   │   └── profile/
│   │
│   ├── viewModels/             # Lógica de negócio
│   │   ├── useAuth.viewModel.ts
│   │   ├── useDashboard.viewModel.ts
│   │   ├── useTransaction.viewModel.ts
│   │   └── useBudget.viewModel.ts
│   │
│   ├── shared/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   └── Charts/
│   │   ├── services/           # API e persistência
│   │   │   ├── api/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── transactions.service.ts
│   │   │   └── storage/
│   │   │       └── sqlite.service.ts
│   │   ├── models/             # DTOs e tipos
│   │   │   ├── User.model.ts
│   │   │   ├── Transaction.model.ts
│   │   │   └── Budget.model.ts
│   │   ├── schemas/            # Validações Zod
│   │   ├── hooks/              # Hooks customizados
│   │   └── utils/
│   │
│   ├── routes/                 # Navegação
│   │   ├── app.routes.tsx
│   │   ├── auth.routes.tsx
│   │   └── index.tsx
│   │
│   └── App.tsx
│
├── assets/
├── app.json
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

### 4.4 Plataformas Suportadas

| Plataforma | Versão Mínima | Prioridade |
|------------|---------------|------------|
| **iOS** | 13.0+ | P0 |
| **Android** | 10 (API 29+) | P0 |
| **Web** | Não suportado no MVP | - |

---

## 5. Design e Experiência do Usuário

### 5.1 Diretrizes de Design

**Sistema de Design:**
- **Cores Primárias:**
  - Primary: `#5843BE` (roxo característico)
  - Secondary: `#3B82F6` (azul)
  - Success: `#10B981` (verde)
  - Error: `#EF4444` (vermelho)
  - Warning: `#F59E0B` (amarelo)

- **Tipografia:**
  - Font Family: Inter (sistema)
  - Tamanhos: 12px, 14px, 16px, 20px, 24px, 32px

- **Espaçamento:**
  - Grid base: 8px
  - Padding padrão: 16px (telas)

**Princípios de UX:**
1. **Mobile-First:** Toda interação otimizada para toque
2. **Feedback Imediato:** Loading states, animações suaves
3. **Onboarding Progressivo:** Descoberta natural de funcionalidades
4. **Menos é Mais:** Máximo 3 ações por tela

### 5.2 Fluxos Principais

#### Fluxo 1: Primeiro Acesso
```
Splash Screen → Onboarding (3 telas) → Cadastro →
Configuração Inicial → Dashboard
```
**Tempo esperado:** < 3 minutos

#### Fluxo 2: Registro de Transação
```
Dashboard → FAB (+) → Formulário → Confirmação →
Dashboard Atualizado
```
**Tempo esperado:** < 30 segundos

#### Fluxo 3: Consulta de Relatórios
```
Dashboard → Tab "Relatórios" → Filtros →
Visualização de Gráficos
```
**Tempo esperado:** < 15 segundos

### 5.3 Acessibilidade

**Requisitos Mínimos:**
- ✅ Suporte a leitores de tela (iOS VoiceOver, Android TalkBack)
- ✅ Contraste mínimo WCAG AA (4.5:1 para texto)
- ✅ Tamanho mínimo de toque: 44x44 pixels (iOS), 48x48 pixels (Android)
- ✅ Labels semânticos em todos os elementos interativos
- ✅ Suporte a fontes grandes (iOS Dynamic Type, Android Font Scale)

---

## 6. Requisitos Não-Funcionais

### 6.1 Performance

| Métrica | Requisito | Medição |
|---------|-----------|---------|
| **Tempo de inicialização** | < 3 segundos | Splash até Dashboard |
| **Tempo de resposta (API)** | < 1 segundo | 95% das requisições |
| **Frame rate** | 60 FPS | Animações e scrolling |
| **Tamanho do app** | < 50 MB | Download inicial (iOS/Android) |
| **Uso de memória** | < 200 MB | Em uso ativo |

### 6.2 Segurança

- **SS01:** Tokens JWT armazenados em Keychain (iOS) / Keystore (Android)
- **SS02:** Comunicação exclusiva via HTTPS (TLS 1.3+)
- **SS03:** Biometria opcional, fallback para senha
- **SS04:** Timeout de sessão após 30 minutos de inatividade
- **SS05:** Dados locais (SQLite) não criptografados no MVP, mas isolados por sandbox
- **SS06:** Validação de inputs no cliente e servidor

### 6.3 Escalabilidade

- **ES01:** Suporte a até 10.000 transações por usuário
- **ES02:** Sincronização incremental com backend
- **ES03:** Paginação de listas (50 itens por página)
- **ES04:** Cache de dados frequentes (categorias, contas)

### 6.4 Confiabilidade

- **CR01:** Crash-free rate > 99%
- **CR02:** Retry automático em falhas de rede (3 tentativas)
- **CR03:** Mensagens de erro amigáveis e acionáveis
- **CR04:** Logging de erros com Sentry (produção)

### 6.5 Compatibilidade

- **CP01:** iOS 13+ (iPhone 6s ou superior)
- **CP02:** Android 10+ (API 29+)
- **CP03:** Orientação: Portrait (apenas vertical no MVP)
- **CP04:** Idioma: Português (BR) no MVP

---

## 7. Testes e Qualidade

### 7.1 Estratégia de Testes

#### Cobertura Mínima: 70%

**Tipos de Testes:**

1. **Testes Unitários (Jest + Testing Library)**
   - ViewModels (lógica de negócio)
   - Services (API calls, storage)
   - Utils e helpers
   - **Target:** 80% de cobertura

2. **Testes de Integração (React Native Testing Library)**
   - Componentes complexos
   - Fluxos de formulários
   - Navegação entre telas
   - **Target:** 60% de cobertura

3. **Testes E2E (Detox)**
   - Fluxos críticos:
     - Login/Cadastro
     - Criar transação
     - Visualizar dashboard
   - **Target:** 3-5 casos de teste principais

4. **Testes Manuais**
   - Testes exploratórios em dispositivos físicos
   - Validação de design e UX
   - Teste em diferentes tamanhos de tela

### 7.2 Ambientes

| Ambiente | Uso | Configuração |
|----------|-----|--------------|
| **Development** | Desenvolvimento local | API local/staging |
| **Staging** | Testes QA | API staging, Expo Go |
| **Production** | Usuários finais | API produção, builds nativos |

### 7.3 Checklist de Quality Assurance

**Antes de Release:**
- [ ] Todos os testes unitários passando
- [ ] Testes E2E críticos passando
- [ ] Teste manual em iOS (iPhone 11+)
- [ ] Teste manual em Android (Samsung Galaxy S10+)
- [ ] Validação de acessibilidade (VoiceOver/TalkBack)
- [ ] Performance testada (< 3s de carregamento)
- [ ] Build de produção sem warnings
- [ ] Políticas de privacidade e termos atualizados

---

## 8. Deploy e Distribuição

### 8.1 Pipeline de Deploy

**Ferramenta:** EAS Build (Expo Application Services)

#### iOS (TestFlight)
1. Build via EAS: `eas build --platform ios --profile production`
2. Upload automático para App Store Connect
3. Distribuição via TestFlight (beta testers)
4. Revisão e publicação na App Store

**Requisitos:**
- Apple Developer Account (US$ 99/ano)
- Certificados e provisioning profiles configurados
- App Store listing pronto (screenshots, descrição, ícone)

#### Android (Firebase App Distribution → Google Play)
1. Build via EAS: `eas build --platform android --profile production`
2. Distribuição beta via Firebase App Distribution
3. Upload manual para Google Play Console (produção)

**Requisitos:**
- Google Play Developer Account (US$ 25 pagamento único)
- Keystore configurado e seguro
- Google Play listing pronto

### 8.2 Versionamento

**Estratégia:** Semantic Versioning (semver)
- **Major.Minor.Patch** (ex: 1.0.0)
- **Major:** Mudanças incompatíveis
- **Minor:** Novas funcionalidades compatíveis
- **Patch:** Correções de bugs

**Releases Planejadas:**
- **v1.0.0:** MVP completo (lançamento inicial)
- **v1.1.0:** Ajustes pós-feedback inicial
- **v1.2.0:** Melhorias de performance e UX

### 8.3 Rollout Strategy

**Fase 1: Beta Fechado (2 semanas)**
- 50 usuários convidados
- Foco em identificar bugs críticos

**Fase 2: Beta Aberto (4 semanas)**
- TestFlight (iOS) / Firebase App Distribution (Android)
- 500-1000 usuários
- Coletar feedback qualitativo

**Fase 3: Soft Launch (2 semanas)**
- Lançamento apenas no Brasil
- Monitoramento intensivo de métricas

**Fase 4: Launch Completo**
- Publicação nas lojas
- Campanha de marketing

---

## 9. Riscos e Mitigações

### 9.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Problemas com biometria em dispositivos antigos** | Média | Médio | Implementar fallback robusto para senha, testes extensivos |
| **Performance em dispositivos Android low-end** | Alta | Alto | Otimização de renderização, uso de FlatList, throttling de APIs |
| **Diferenças de comportamento iOS vs Android** | Média | Médio | Testes em ambas plataformas, conditional rendering quando necessário |
| **Limitações do Expo** | Baixa | Médio | Migrar para bare workflow se necessário (decisão reversível) |
| **Sincronização de dados offline** | Média | Alto | Não implementar offline robusto no MVP, apenas cache básico |

### 9.2 Riscos de Produto

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Baixa adoção inicial** | Média | Alto | Investir em onboarding claro, UX excepcional, programa de indicação |
| **Concorrência de apps estabelecidos** | Alta | Alto | Diferenciação via simplicidade e foco mobile, nicho inicial específico |
| **Churn alto** | Média | Alto | Notificações inteligentes, gamificação leve (pós-MVP), valor imediato |
| **Complexidade percebida** | Baixa | Médio | Onboarding interativo, tooltips contextuais, tutoriais curtos |

### 9.3 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Custos de infraestrutura maiores que esperado** | Baixa | Médio | Monitoramento de custos, otimização de APIs, caching agressivo |
| **Rejeição nas app stores** | Baixa | Alto | Seguir guidelines à risca, revisão prévia com checklist oficial |
| **Problemas de privacidade/LGPD** | Baixa | Alto | Compliance desde o início, política de privacidade clara, minimização de dados |

---

## 10. Cronograma e Marcos

### 10.1 Fases de Desenvolvimento

**Duração Total Estimada:** 12-14 semanas

#### Sprint 0: Preparação (1 semana)
- Configuração do ambiente Expo + EAS
- Setup de CI/CD
- Estrutura de projeto (MVVM)
- Design system básico

#### Sprint 1-2: Autenticação e Infraestrutura (2 semanas)
- RF01: Autenticação completa
- Integração com backend Rails
- Persistência local (SQLite)
- Navegação básica

#### Sprint 3-4: Dashboard e Transações (2 semanas)
- RF02: Dashboard principal
- RF03: Formulário de transação
- RF04: Contas e categorias

#### Sprint 5-6: Orçamentos e Relatórios (2 semanas)
- RF05: Gestão de orçamentos
- RF06: Relatórios básicos
- Gráficos com Victory Native

#### Sprint 7-8: Perfil, Notificações e Polimento (2 semanas)
- RF07: Perfil e configurações
- RF08: Notificações push
- Modo escuro
- Ajustes de UX

#### Sprint 9-10: Testes e QA (2 semanas)
- Testes E2E com Detox
- Testes em dispositivos reais
- Correção de bugs
- Performance optimization

#### Sprint 11-12: Beta e Ajustes (2 semanas)
- Beta fechado e aberto
- Iterações baseadas em feedback
- Preparação para lançamento

### 10.2 Marcos Críticos

| Marco | Data Estimada | Critério de Sucesso |
|-------|---------------|---------------------|
| **M1: Infraestrutura Pronta** | Semana 3 | Autenticação funcional, build rodando em TestFlight |
| **M2: Funcionalidades Core** | Semana 7 | Dashboard + Transações operacionais |
| **M3: Feature Complete** | Semana 9 | Todas as RFs implementadas |
| **M4: Beta Fechado** | Semana 11 | 50 usuários testando, sem crashes críticos |
| **M5: Launch** | Semana 14 | App publicado nas lojas |

---

## 11. Dependências e Integrações

### 11.1 Dependências Internas

- **Backend Rails:** API v1 com endpoints de autenticação e CRUD de recursos
- **Design System:** Tokens de cor e tipografia alinhados com web

### 11.2 Dependências Externas

| Serviço | Propósito | Criticidade |
|---------|-----------|-------------|
| **Expo EAS** | Build e deployment | Alta |
| **Sentry** | Error tracking (produção) | Média |
| **Firebase Cloud Messaging** | Push notifications (opcional) | Baixa |
| **Apple Developer Program** | Publicação iOS | Alta |
| **Google Play Console** | Publicação Android | Alta |

### 11.3 APIs de Terceiros

- Nenhuma no MVP (futuro: Open Finance, APIs bancárias)

---

## 12. Premissas e Restrições

### 12.1 Premissas Assumidas

1. **Backend Rails está estável** e endpoints necessários estarão prontos até Sprint 2
2. **Usuários têm conexão à internet** para funcionalidades principais (offline básico apenas)
3. **Dispositivos suportam biometria** ou usuários aceitam usar senha
4. **Expo SDK 54** é suficiente para todas as funcionalidades do MVP
5. **Budget de marketing existe** para divulgação pós-lançamento
6. **Equipe de design** fornecerá assets (ícones, logos, onboarding) até Sprint 1
7. **Testes em dispositivos reais** serão feitos internamente (iOS + Android)
8. **Políticas de privacidade e termos** serão escritos por time jurídico

### 12.2 Restrições

1. **Orçamento:** Limitado a ferramentas gratuitas/low-cost (Expo free tier + store fees)
2. **Prazo:** 14 semanas até lançamento (não negociável)
3. **Equipe:** 1-2 desenvolvedores mobile + 1 designer (part-time)
4. **Idioma:** Apenas Português (BR) no MVP
5. **Plataformas:** iOS e Android apenas (web fora do escopo)
6. **Offline:** Funcionalidades offline robustas são pós-MVP

---

## 13. Monitoramento e Analytics

### 13.1 Eventos a Serem Rastreados

**Ferramenta:** Firebase Analytics (gratuito)

#### Eventos de Onboarding
- `onboarding_start`
- `onboarding_complete`
- `onboarding_skip`

#### Eventos de Autenticação
- `signup_success`
- `login_success`
- `biometry_enabled`

#### Eventos de Transação
- `transaction_create`
- `transaction_edit`
- `transaction_delete`

#### Eventos de Engagement
- `dashboard_view`
- `reports_view`
- `budget_create`

### 13.2 Métricas de Produto

- **DAU/MAU** (Daily/Monthly Active Users)
- **Retention Rate** (Day 1, Day 7, Day 30)
- **Session Duration** (tempo médio por sessão)
- **Transações por usuário por dia**
- **Taxa de conclusão de onboarding**

---

## 14. Critérios de Aceitação para o MVP

### 14.1 Definição de "Pronto"

O MVP será considerado completo quando:

1. ✅ Todas as funcionalidades P0 e P1 estão implementadas e testadas
2. ✅ Cobertura de testes ≥ 70%
3. ✅ Testes E2E críticos passando (login, transação, dashboard)
4. ✅ Builds gerados com sucesso para iOS e Android
5. ✅ Beta testado por 50+ usuários sem crashes críticos
6. ✅ Performance atende requisitos não-funcionais (< 3s inicialização)
7. ✅ Acessibilidade básica validada (VoiceOver/TalkBack)
8. ✅ Políticas de privacidade e termos aprovados
9. ✅ App Store e Google Play listings completos

### 14.2 Checklist de Lançamento

**Técnico:**
- [ ] Versão 1.0.0 tagged no Git
- [ ] Build de produção gerado via EAS
- [ ] Environment variables configuradas (prod)
- [ ] Sentry configurado e testado
- [ ] Push notifications testadas

**Produto:**
- [ ] Onboarding validado com 10+ usuários
- [ ] Screenshots e vídeos para stores prontos
- [ ] Descrição e keywords otimizados (ASO)
- [ ] FAQ e documentação de ajuda publicados

**Negócio:**
- [ ] Políticas de privacidade publicadas
- [ ] Termos de uso publicados
- [ ] Plano de marketing definido
- [ ] Suporte ao usuário configurado (email/chat)

---

## 15. Próximos Passos (Pós-MVP)

### 15.1 Roadmap Futuro (v1.1 - v2.0)

**v1.1 (1-2 meses pós-launch):**
- OCR para captura de recibos
- Exportação de dados (CSV/PDF)
- Widgets de tela inicial
- Modo offline robusto

**v1.2 (3-4 meses):**
- Integrações bancárias (Open Finance)
- Metas de economia com gamificação
- Compartilhamento de orçamentos (família)
- Apple Watch / Wear OS

**v2.0 (6+ meses):**
- Análise preditiva com IA
- Recomendações personalizadas
- Multi-moeda e multi-idioma
- Planos premium (freemium)

### 15.2 Criação de Tech Spec

**Ação Imediata:** Criar documento de Especificação Técnica detalhando:
- Arquitetura de componentes
- Fluxos de dados (MVVM)
- Schemas de banco (SQLite)
- Contratos de API (OpenAPI)
- Estratégias de cache
- Tratamento de erros
- Setup de CI/CD

---

## 16. Glossário

| Termo | Definição |
|-------|-----------|
| **MVP** | Minimum Viable Product - versão mínima funcional do produto |
| **FAB** | Floating Action Button - botão flutuante de ação rápida |
| **KPI** | Key Performance Indicator - indicador-chave de performance |
| **DAU/MAU** | Daily/Monthly Active Users - usuários ativos diários/mensais |
| **P0/P1/P2** | Níveis de prioridade (P0 = crítica, P1 = alta, P2 = média) |
| **MVVM** | Model-View-ViewModel - padrão arquitetural |
| **JWT** | JSON Web Token - formato de token de autenticação |
| **EAS** | Expo Application Services - serviços de build do Expo |
| **OCR** | Optical Character Recognition - reconhecimento óptico de caracteres |
| **ASO** | App Store Optimization - otimização para lojas de apps |

---

## 17. Aprovações e Sign-Off

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| **Product Manager** | Thiago Cardoso | 2025-11-10 | ✅ Aprovado |
| **Tech Lead** | [A definir] | - | Pendente |
| **Designer** | [A definir] | - | Pendente |
| **Stakeholder** | [A definir] | - | Pendente |

---

## 18. Anexos

### A. Referências Técnicas

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [NativeWind Setup](https://www.nativewind.dev/)
- [Victory Native Charts](https://commerce.nearform.com/open-source/victory-native/)
- [React Navigation](https://reactnavigation.org/)
- [Arquivo architectural-mobile.md do projeto](/Users/thiagocardoso/Documents/finance-app/architectural-mobile.md)

### B. Versões das Tecnologias

**Principais:**
- React Native: **0.82.0**
- Expo SDK: **54.0.0**
- NativeWind: **4.2.0**
- TypeScript: **5.3+**

**Dependências Chave:**
```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "react-native": "0.82.0",
    "nativewind": "4.2.0",
    "react-navigation": "^6.0.0",
    "zustand": "^4.5.0",
    "zod": "^3.22.0",
    "victory-native": "^37.0.0",
    "expo-local-authentication": "~14.0.0",
    "expo-notifications": "~0.29.0",
    "expo-sqlite": "~14.0.0"
  }
}
```

### C. Contatos

- **Product Manager:** thiago.cardoso@finance-app.com
- **Tech Lead:** [email]
- **Suporte EAS:** https://expo.dev/support

---

**Documento gerado com apoio de Claude Code**
**Última atualização:** 2025-11-10
**Versão do documento:** 1.0

---

