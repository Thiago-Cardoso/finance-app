# Product Requirement Document (PRD)
# Aplicativo de Controle Financeiro Pessoal

## 1. Visão do Produto

### 1.1 Resumo Executivo
O Aplicativo de Controle Financeiro Pessoal é uma solução web moderna que permite aos usuários gerenciar suas finanças pessoais de forma eficiente e intuitiva. A aplicação oferece funcionalidades completas de controle de receitas, despesas, categorização, relatórios e planejamento financeiro, utilizando uma arquitetura separada entre backend (Ruby on Rails 8 API) e frontend (Next.js 15).

### 1.2 Objetivos do Produto
- **Objetivo Principal**: Proporcionar controle total das finanças pessoais através de uma interface moderna e intuitiva
- **Objetivos Secundários**:
  - Automatizar a categorização de transações
  - Gerar insights financeiros através de relatórios e dashboards
  - Facilitar o planejamento financeiro com metas e orçamentos
  - Oferecer experiência mobile-first responsiva
  - Garantir segurança e privacidade dos dados financeiros

### 1.3 Proposta de Valor
- Interface moderna e responsiva com TailwindCSS
- Arquitetura escalável e moderna (Rails 8 + Next.js 15)
- Segurança robusta com autenticação JWT
- Relatórios e dashboards interativos
- Categorização inteligente de transações
- Planejamento financeiro com metas e orçamentos

## 2. Análise de Mercado e Usuários

### 2.1 Personas

#### Persona 1: Maria Silva - Profissional Liberal
- **Idade**: 32 anos
- **Profissão**: Designer Freelancer
- **Renda**: R$ 3.500 - R$ 8.000/mês (variável)
- **Objetivos**: Controlar fluxo de caixa irregular, separar gastos pessoais e profissionais
- **Dores**: Dificuldade em prever receitas, gastos misturados, falta de organização financeira
- **Comportamento**: Usa smartphone 80% do tempo, valoriza interfaces simples e visuais

#### Persona 2: João Santos - Assalariado
- **Idade**: 28 anos
- **Profissão**: Analista de TI
- **Renda**: R$ 5.500/mês (fixa)
- **Objetivos**: Economizar para casa própria, controlar gastos supérfluos
- **Dores**: Gastos impulsivos, falta de visibilidade dos gastos mensais
- **Comportamento**: Tech-savvy, busca automação e eficiência

#### Persona 3: Ana Costa - Estudante/Jovem Profissional
- **Idade**: 24 anos
- **Profissão**: Estagiária/Recém-formada
- **Renda**: R$ 1.200 - R$ 2.500/mês
- **Objetivos**: Aprender educação financeira, controlar gastos básicos
- **Dores**: Renda baixa, falta de conhecimento financeiro, gastos descontrolados
- **Comportamento**: Mobile-first, busca simplicidade e aprendizado

### 2.2 Jornada do Usuário

#### Jornada de Onboarding
1. **Descoberta**: Usuário busca solução para controle financeiro
2. **Cadastro**: Registro simples com email/senha
3. **Configuração Inicial**: Define categorias, contas bancárias, orçamento inicial
4. **Primeira Transação**: Adiciona receitas e despesas iniciais
5. **Exploração**: Navega pelo dashboard e relatórios
6. **Engajamento**: Uso regular com notificações e insights

#### Jornada de Uso Diário
1. **Entrada**: Login via JWT token
2. **Visão Geral**: Dashboard com resumo financeiro
3. **Registro**: Adiciona nova transação
4. **Análise**: Consulta relatórios e categorias
5. **Planejamento**: Ajusta metas e orçamentos
6. **Saída**: Logout seguro

## 3. Funcionalidades Detalhadas

### 3.1 Módulo de Autenticação
**Funcionalidade**: Sistema completo de autenticação e autorização
**Prioridade**: P0 (Crítica)

**Critérios de Aceitação**:
- [ ] Registro de usuário com email e senha
- [ ] Login/logout com JWT tokens
- [ ] Recuperação de senha via email
- [ ] Validação de email no cadastro
- [ ] Proteção contra ataques de força bruta
- [ ] Logout automático por inatividade
- [ ] Gerenciamento de sessões múltiplas

**Casos de Uso**:
- Como usuário, quero me cadastrar com email e senha
- Como usuário, quero fazer login de forma segura
- Como usuário, quero recuperar minha senha caso esqueça
- Como usuário, quero que minha sessão expire automaticamente por segurança

### 3.2 Dashboard Financeiro
**Funcionalidade**: Painel principal com visão geral das finanças
**Prioridade**: P0 (Crítica)

**Critérios de Aceitação**:
- [ ] Resumo de receitas e despesas do mês atual
- [ ] Saldo atual e evolução mensal
- [ ] Gráfico de receitas vs despesas (últimos 6 meses)
- [ ] Top 5 categorias de gastos
- [ ] Alertas de orçamento excedido
- [ ] Transações recentes (últimas 10)
- [ ] Meta de economia e progresso
- [ ] Interface responsiva para mobile e desktop

**Casos de Uso**:
- Como usuário, quero ver minha situação financeira atual rapidamente
- Como usuário, quero identificar meus principais gastos
- Como usuário, quero acompanhar meu progresso em relação às metas

### 3.3 Gestão de Transações
**Funcionalidade**: CRUD completo de receitas e despesas
**Prioridade**: P0 (Crítica)

**Critérios de Aceitação**:
- [ ] Adicionar receita com descrição, valor, categoria, data
- [ ] Adicionar despesa com descrição, valor, categoria, data
- [ ] Editar transações existentes
- [ ] Excluir transações com confirmação
- [ ] Listar transações com filtros (data, categoria, tipo, valor)
- [ ] Buscar transações por descrição
- [ ] Paginação de resultados
- [ ] Validação de campos obrigatórios
- [ ] Formatação automática de valores monetários

**Casos de Uso**:
- Como usuário, quero registrar uma nova receita
- Como usuário, quero registrar uma nova despesa
- Como usuário, quero editar uma transação existente
- Como usuário, quero filtrar transações por período
- Como usuário, quero buscar uma transação específica

### 3.4 Sistema de Categorias
**Funcionalidade**: Organização de transações por categorias
**Prioridade**: P0 (Crítica)

**Critérios de Aceitação**:
- [ ] Categorias padrão pré-definidas (Alimentação, Transporte, Lazer, etc.)
- [ ] Criar categorias personalizadas
- [ ] Editar/excluir categorias criadas pelo usuário
- [ ] Associar cores às categorias
- [ ] Relatório de gastos por categoria
- [ ] Subcategorias (opcional)
- [ ] Transferência de transações entre categorias

**Casos de Uso**:
- Como usuário, quero criar uma categoria personalizada
- Como usuário, quero organizar meus gastos por categoria
- Como usuário, quero ver quanto gasto em cada categoria

### 3.5 Relatórios e Análises
**Funcionalidade**: Geração de relatórios financeiros detalhados
**Prioridade**: P1 (Alta)

**Critérios de Aceitação**:
- [ ] Relatório mensal de receitas vs despesas
- [ ] Gráfico de evolução do saldo
- [ ] Análise de gastos por categoria (pizza chart)
- [ ] Comparativo entre meses
- [ ] Exportação para PDF
- [ ] Relatório de fluxo de caixa
- [ ] Identificação de tendências de gastos
- [ ] Filtros por período personalizado

**Casos de Uso**:
- Como usuário, quero visualizar meus gastos mensais
- Como usuário, quero comparar gastos entre diferentes meses
- Como usuário, quero exportar relatórios para PDF

### 3.6 Planejamento e Metas
**Funcionalidade**: Definição de orçamentos e metas financeiras
**Prioridade**: P1 (Alta)

**Critérios de Aceitação**:
- [ ] Definir orçamento mensal por categoria
- [ ] Alertas quando orçamento atingir 80% e 100%
- [ ] Metas de economia mensais/anuais
- [ ] Acompanhamento do progresso das metas
- [ ] Sugestões de economia baseadas no histórico
- [ ] Planejamento de gastos futuros
- [ ] Simulador de cenários financeiros

**Casos de Uso**:
- Como usuário, quero definir um orçamento mensal
- Como usuário, quero ser alertado quando estou gastando muito
- Como usuário, quero definir uma meta de economia

### 3.7 Contas e Cartões
**Funcionalidade**: Gestão de múltiplas contas bancárias e cartões
**Prioridade**: P2 (Média)

**Critérios de Aceitação**:
- [ ] Cadastrar múltiplas contas bancárias
- [ ] Cadastrar cartões de crédito/débito
- [ ] Transferências entre contas
- [ ] Saldo por conta
- [ ] Histórico de transações por conta
- [ ] Reconciliação de extratos
- [ ] Alertas de vencimento de cartão

**Casos de Uso**:
- Como usuário, quero gerenciar múltiplas contas bancárias
- Como usuário, quero fazer transferências entre contas
- Como usuário, quero ver o saldo de cada conta

## 4. Requisitos Técnicos

### 4.1 Arquitetura do Sistema

#### Backend (API)
- **Framework**: Ruby on Rails 8 (API-only mode)
- **Versão Ruby**: 3.2+
- **Banco de Dados**: PostgreSQL 15+ (hospedado no Supabase)

- **Autenticação**: JWT tokens com Devise
- **Testes**: RSpec com TDD
- **Background Jobs**: Sidekiq + Redis
- **Containerização**: Docker + Docker Compose
- **Deploy**: AWS ECS Fargate

#### Frontend (SPA)
- **Framework**: Next.js 15 (App Router)
- **Versão Node.js**: 18+
- **Styling**: TailwindCSS + Componentes reutilizáveis
- **Estado**: Context API + React Query
- **Testes**: Jest + React Testing Library
- **Build**: Vercel ou AWS S3 + CloudFront

#### Banco de Dados
- **SGBD**: PostgreSQL 15+ (Supabase)
- **ORM**: Active Record (Rails)
- **Migrações**: Rails migrations + MCP Supabase
- **Backup**: Supabase automated backups
- **Performance**: Índices otimizados + connection pooling

- Supabase PostgreSQL para persistência de dados
* Criar instância PostgreSQL no Supabase.
* Usar MCP do Supabase para gerenciar migrações e conexão.
* Configurar .env no Rails e no Next.js para usar as credenciais do Supabase.

### 4.2 APIs e Integrações

#### API RESTful
- **Versionamento**: /api/v1/
- **Formato**: JSON
- **Documentação**: Swagger/OpenAPI
- **Rate Limiting**: 1000 req/hour por usuário
- **CORS**: Configurado para frontend domains

#### Endpoints Principais
```
POST   /api/v1/auth/sign_in
POST   /api/v1/auth/sign_up
DELETE /api/v1/auth/sign_out

GET    /api/v1/dashboard
GET    /api/v1/transactions
POST   /api/v1/transactions
PUT    /api/v1/transactions/:id
DELETE /api/v1/transactions/:id

GET    /api/v1/categories
POST   /api/v1/categories
PUT    /api/v1/categories/:id
DELETE /api/v1/categories/:id

GET    /api/v1/reports/monthly
GET    /api/v1/reports/category
GET    /api/v1/reports/export

GET    /api/v1/budgets
POST   /api/v1/budgets
PUT    /api/v1/budgets/:id

GET    /api/v1/accounts
POST   /api/v1/accounts
```

### 4.3 Segurança

#### Autenticação e Autorização
- JWT tokens com refresh token
- Expiração de token: 24h (access) / 7 dias (refresh)
- Rate limiting por IP e usuário
- Proteção CSRF
- Headers de segurança (HSTS, CSP, etc.)

#### Proteção de Dados
- HTTPS obrigatório em produção
- Criptografia de dados sensíveis
- Validação de entrada rigorosa
- Sanitização de outputs
- Logs de auditoria
- LGPD compliance

#### Infraestrutura
- WAF (Web Application Firewall)
- DDoS protection
- Backup automático diário
- Monitoramento de segurança
- Análise de vulnerabilidades

### 4.4 Performance

#### Frontend
- Code splitting por rota
- Lazy loading de componentes
- Otimização de imagens
- Service Worker para cache
- Bundle size < 250KB

#### Backend
- Cache Redis para queries frequentes
- Database indexing otimizado
- Connection pooling
- Background jobs para operações pesadas
- CDN para assets estáticos

#### Métricas de Performance
- Tempo de carregamento < 2s
- First Contentful Paint < 1.5s
- API response time < 500ms
- Uptime > 99.9%

## 5. Cronograma e Marcos

### 5.1 Fase 1: Foundation (4 semanas)
**Marco**: MVP Básico Funcional

**Semana 1-2: Backend Setup**
- [ ] Configuração Rails 8 API
- [ ] Setup PostgreSQL + Supabase
- [ ] Autenticação JWT + Devise
- [ ] Models básicos (User, Transaction, Category)
- [ ] API endpoints essenciais
- [ ] Testes unitários RSpec

**Semana 3-4: Frontend Setup**
- [ ] Configuração Next.js 15
- [ ] Setup TailwindCSS
- [ ] Componentes básicos
- [ ] Integração com API
- [ ] Páginas principais (Login, Dashboard, Transações)
- [ ] Testes Frontend

### 5.2 Fase 2: Core Features (6 semanas)
**Marco**: Funcionalidades Principais Implementadas

**Semana 5-6: Gestão de Transações**
- [ ] CRUD completo de transações
- [ ] Sistema de categorias
- [ ] Filtros e busca
- [ ] Validações e formatações

**Semana 7-8: Dashboard e Relatórios**
- [ ] Dashboard principal
- [ ] Gráficos e visualizações
- [ ] Relatórios básicos
- [ ] Exportação PDF

**Semana 9-10: Planejamento Financeiro**
- [ ] Sistema de orçamentos
- [ ] Metas de economia
- [ ] Alertas e notificações
- [ ] Projeções financeiras

### 5.3 Fase 3: Advanced Features (4 semanas)
**Marco**: Funcionalidades Avançadas

**Semana 11-12: Contas Múltiplas**
- [ ] Gestão de contas bancárias
- [ ] Transferências entre contas
- [ ] Reconciliação
- [ ] Relatórios por conta

**Semana 13-14: Otimizações e Polish**
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Mobile responsiveness
- [ ] Acessibilidade (WCAG)

### 5.4 Fase 4: Deploy e Launch (2 semanas)
**Marco**: Aplicação em Produção

**Semana 15-16: Deploy e Produção**
- [ ] Setup AWS ECS Fargate
- [ ] CI/CD pipelines
- [ ] Monitoramento e logs
- [ ] Testes de carga
- [ ] Launch MVP

## 6. Métricas de Sucesso e KPIs

### 6.1 Métricas de Produto
- **Taxa de Conversão de Cadastro**: > 15%
- **Retenção D7**: > 40%
- **Retenção D30**: > 25%
- **Sessões por Usuário Ativo**: > 8/mês
- **Tempo Médio de Sessão**: > 5 minutos
- **Taxa de Churn Mensal**: < 10%

### 6.2 Métricas de Engajamento
- **Transações por Usuário/Mês**: > 20
- **Usuários que usam Dashboard**: > 80%
- **Usuários que criam Orçamentos**: > 60%
- **Usuários que exportam Relatórios**: > 30%
- **NPS (Net Promoter Score)**: > 50

### 6.3 Métricas Técnicas
- **Uptime**: > 99.9%
- **Tempo de Response API**: < 500ms
- **Erro Rate**: < 0.1%
- **Page Load Time**: < 2s
- **Mobile Performance Score**: > 90

### 6.4 Métricas de Segurança
- **Tentativas de Login Bloqueadas**: < 0.01%
- **Vulnerabilidades Críticas**: 0
- **Tempo de Resolução de Incidentes**: < 4h
- **Compliance LGPD**: 100%

## 7. Riscos e Estratégias de Mitigação

### 7.1 Riscos Técnicos

#### Risco: Performance do Banco de Dados
- **Probabilidade**: Média
- **Impacto**: Alto
- **Mitigação**:
  - Indexação otimizada desde o início
  - Connection pooling configurado
  - Monitoramento de performance contínuo
  - Cache Redis para queries frequentes

#### Risco: Escalabilidade Frontend
- **Probabilidade**: Média
- **Impacto**: Médio
- **Mitigação**:
  - Code splitting implementado
  - Lazy loading de componentes
  - CDN para assets estáticos
  - Performance budgets definidos

#### Risco: Segurança de Dados Financeiros
- **Probabilidade**: Baixa
- **Impacto**: Crítico
- **Mitigação**:
  - Criptografia end-to-end
  - Auditoria de segurança regular
  - Testes de penetração
  - Compliance com padrões financeiros

### 7.2 Riscos de Produto

#### Risco: Baixa Adoção de Usuários
- **Probabilidade**: Média
- **Impacto**: Alto
- **Mitigação**:
  - Pesquisa de usuário contínua
  - MVP focado em core value
  - Onboarding simplificado
  - Feedback loops rápidos

#### Risco: Complexidade de Interface
- **Probabilidade**: Média
- **Impacto**: Médio
- **Mitigação**:
  - Design system consistente
  - Testes de usabilidade
  - Progressive disclosure
  - Mobile-first approach

### 7.3 Riscos de Negócio

#### Risco: Concorrência Estabelecida
- **Probabilidade**: Alta
- **Impacto**: Médio
- **Mitigação**:
  - Diferenciação clara no MVP
  - Focus em experiência do usuário
  - Funcionalidades únicas
  - Rapid iteration baseada em feedback

#### Risco: Mudanças Regulatórias (LGPD/BACEN)
- **Probabilidade**: Baixa
- **Impacto**: Alto
- **Mitigação**:
  - Compliance desde o design
  - Consultor jurídico especializado
  - Monitoramento regulatório
  - Arquitetura flexível para mudanças

## 8. Dependências e Integrações

### 8.1 Dependências Críticas
- **Supabase PostgreSQL**: Banco de dados principal
- **JWT Libraries**: Autenticação segura
- **TailwindCSS**: Framework de UI
- **Next.js 15**: Framework frontend
- **Rails 8**: Framework backend

### 8.2 Integrações Futuras (Roadmap)
- **Open Banking**: Importação automática de extratos
- **PIX API**: Integração com sistema de pagamentos
- **Serasa/SPC**: Consulta de score de crédito
- **Notificações Push**: Alertas mobile
- **IA/ML**: Categorização automática inteligente

### 8.3 Dependências de Deploy
- **AWS ECS Fargate**: Container orchestration
- **Docker**: Containerização
- **GitHub Actions**: CI/CD
- **CloudWatch**: Monitoramento
- **Route53**: DNS management

## 9. Critérios de Aceitação do MVP

### 9.1 Funcionalidades Obrigatórias
- [ ] Cadastro e login de usuários
- [ ] Dashboard com resumo financeiro
- [ ] CRUD de transações (receitas/despesas)
- [ ] Sistema básico de categorias
- [ ] Relatório mensal simples
- [ ] Orçamento básico por categoria
- [ ] Interface responsiva

### 9.2 Qualidade e Performance
- [ ] Testes automatizados > 80% coverage
- [ ] Performance Lighthouse > 90
- [ ] Acessibilidade básica (WCAG AA)
- [ ] Segurança: HTTPS, JWT, validações
- [ ] Deploy automatizado funcionando

### 9.3 Experiência do Usuário
- [ ] Onboarding claro e simples
- [ ] Feedback visual para ações
- [ ] Mensagens de erro claras
- [ ] Carregamento < 2s
- [ ] Mobile usável

---

**Versão**: 1.0
**Data**: 28/09/2025
**Aprovação**: Pendente
**Próxima Revisão**: 05/10/2025