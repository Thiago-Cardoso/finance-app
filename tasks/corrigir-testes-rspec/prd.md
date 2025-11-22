# PRD: Correção dos 77 Testes Falhando do RSpec

## Contexto

O Finance App possui uma suite de testes RSpec com 478 testes, dos quais 77 estão falhando (taxa de falha de ~16%). Embora várias correções já tenham sido implementadas (Goal factory, validações, Budget, Dashboard, Swagger), ainda existem problemas significativos que precisam ser resolvidos.

## Situação Atual

### Status dos Testes
- **Total de testes:** 478
- **Testes passando:** 401 (~84%)
- **Testes falhando:** 77 (~16%)
- **Branch:** fix/tests

### Correções Já Implementadas
1. ✅ Factory Goal (title → name, Faker issues)
2. ✅ Validações de Goal model
3. ✅ GoalProgressService
4. ✅ Testes de Budget
5. ✅ Testes de Dashboard
6. ✅ Specs Swagger de Categories
7. ✅ Warnings Rswag

## Problema

Os 77 testes restantes estão distribuídos em 4 categorias principais:

### 1. Testes de Autenticação (~60 testes - 78% dos problemas)
**Sintoma:** Testes de autenticação esperando status 401 mas recebendo 500 (erro interno)

**Arquivos Afetados:**
- `spec/requests/api/v1/swagger/dashboard_spec.rb`
- `spec/requests/api/v1/swagger/categories_spec.rb`
- `spec/requests/api/v1/swagger/accounts_spec.rb`
- `spec/requests/api/v1/swagger/analytics_spec.rb`
- `spec/requests/api/v1/swagger/transactions_spec.rb`
- `spec/requests/api/v1/swagger/auth_spec.rb`
- `spec/requests/api/v1/transactions_spec.rb`
- `spec/requests/api/v1/categories_spec.rb`

**Causa Raiz Provável:** Controllers não estão tratando corretamente exceções de autenticação, permitindo que exceções sejam capturadas pelo rescue_from global de StandardError ao invés de serem tratadas especificamente como erros de autenticação.

### 2. DashboardService (6 testes - 8% dos problemas)
**Testes Falhando:**
- `spec/services/dashboard_service_spec.rb:87` - total_balance sums only active accounts
- `spec/services/dashboard_service_spec.rb:208` - budget_status returns current active budgets
- `spec/services/dashboard_service_spec.rb:223` - budget_status calculates spent amount correctly
- `spec/services/dashboard_service_spec.rb:242` - budget_status determines budget status correctly
- Testes relacionados a goals_progress

**Causa Provável:** Lógica de filtro de contas ativas, cálculos de budget e integração com goals.

### 3. TransactionFilterService (3 testes - 4% dos problemas)
**Testes Falhando:**
- `spec/services/transaction_filter_service_spec.rb:286` - search_suggestions returns matching descriptions
- `spec/services/transaction_filter_service_spec.rb:254` - filter_options returns user categories
- `spec/services/transaction_filter_service_spec.rb:262` - filter_options returns user accounts

**Causa Provável:** Métodos de sugestão e opções de filtro não implementados ou com lógica incorreta.

### 4. CategoryStatisticsService e Categories (8 testes - 10% dos problemas)
**Testes Falhando:**
- Testes relacionados a estatísticas e trends de categorias
- Problema com prevent deletion of categories with transactions

**Causa Provável:** Lógica de estatísticas e validações de deleção.

## Objetivos

### Objetivo Principal
Reduzir a taxa de falha de testes de 16% para 0%, atingindo 100% de testes passando.

### Objetivos Específicos
1. Corrigir tratamento de autenticação nos controllers (maior impacto - 60 testes)
2. Corrigir lógica do DashboardService (6 testes)
3. Implementar métodos faltantes no TransactionFilterService (3 testes)
4. Corrigir CategoryStatisticsService e validações (8 testes)

## Benefícios Esperados

### Qualidade do Código
- Suite de testes confiável e completa
- Detecção precoce de regressões
- Documentação viva do comportamento do sistema

### Processo de Desenvolvimento
- CI/CD mais confiável
- Confiança para refatorações
- Redução de bugs em produção

### Time
- Menos tempo debugando
- Feedback rápido sobre mudanças
- Onboarding mais fácil de novos desenvolvedores

## Não-Objetivos

1. **Não** adicionar novos testes neste momento (foco em corrigir existentes)
2. **Não** refatorar código que não está relacionado aos testes falhando
3. **Não** otimizar performance dos testes (a menos que seja necessário para correção)
4. **Não** atualizar gems ou dependências (evitar mudanças desnecessárias)

## Requisitos Funcionais

### RF1: Tratamento de Autenticação
- Controllers devem retornar status 401 quando não autenticado
- Exceções de autenticação devem ser tratadas antes do rescue_from global
- Mensagens de erro devem ser claras e consistentes
- Todos os testes de autenticação devem passar

### RF2: DashboardService
- `total_balance` deve somar apenas contas ativas
- `budget_status` deve retornar apenas budgets ativos do período atual
- `budget_status` deve calcular valores gastos corretamente
- `budget_status` deve determinar status (ok/warning/exceeded) corretamente
- `goals_progress` deve funcionar com os novos atributos de Goal

### RF3: TransactionFilterService
- `search_suggestions` deve retornar descrições que correspondem ao termo buscado
- `filter_options` deve retornar categorias do usuário
- `filter_options` deve retornar contas do usuário

### RF4: CategoryStatisticsService
- Cálculos de estatísticas devem estar corretos
- Trends devem ser calculados adequadamente
- Prevenção de deleção de categorias com transações deve funcionar

## Requisitos Não-Funcionais

### RNF1: Manutenibilidade
- Código de correção deve seguir padrões existentes
- Comentários onde lógica for complexa
- Commits organizados por categoria de problema

### RNF2: Performance
- Correções não devem degradar performance dos testes
- Suite completa deve rodar em < 5 minutos

### RNF3: Confiabilidade
- Testes devem ser determinísticos (sem flakiness)
- Seeds de teste devem ser consistentes
- Mocks e stubs devem ser usados apropriadamente

## Critérios de Sucesso

### Critério Principal
- ✅ 0 testes falhando (478/478 testes passando)
- ✅ Taxa de sucesso: 100%

### Critérios Secundários
- ✅ Todos os testes de autenticação passando (60 testes)
- ✅ Todos os testes de DashboardService passando (27 testes)
- ✅ Todos os testes de TransactionFilterService passando
- ✅ Todos os testes de CategoryStatisticsService passando
- ✅ CI/CD passando com branch fix/tests
- ✅ Documentação atualizada (RSPEC_FIXES_SUMMARY.md)

## Riscos e Mitigações

### Risco 1: Correções Causam Novas Falhas
**Probabilidade:** Média
**Impacto:** Alto
**Mitigação:** Rodar suite completa após cada grupo de correções

### Risco 2: Problema Sistêmico Não Identificado
**Probabilidade:** Baixa
**Impacto:** Alto
**Mitigação:** Investigar padrões comuns antes de corrigir individualmente

### Risco 3: Tempo Estimado Incorreto
**Probabilidade:** Média
**Impacto:** Médio
**Mitigação:** Priorizar correções por impacto (autenticação primeiro)

## Abordagem de Implementação

### Fase 1: Investigação (Prioridade: Alta)
1. Analisar logs detalhados dos testes falhando
2. Identificar padrões comuns
3. Criar reprodução mínima do problema

### Fase 2: Correção de Autenticação (Prioridade: Crítica - 78% dos problemas)
1. Corrigir ordem de rescue_from nos controllers
2. Garantir que JwtService::TokenInvalidError seja tratado antes de StandardError
3. Adicionar testes de integração

### Fase 3: Correção de Services (Prioridade: Alta)
1. Corrigir DashboardService (6 testes)
2. Corrigir TransactionFilterService (3 testes)
3. Corrigir CategoryStatisticsService (8 testes)

### Fase 4: Validação (Prioridade: Alta)
1. Rodar suite completa múltiplas vezes
2. Verificar diferentes seeds
3. Atualizar documentação

## Estimativas

### Tempo por Categoria
- **Investigação:** 2-4 horas
- **Correção de Autenticação:** 4-6 horas (maior impacto)
- **Correção de Services:** 3-5 horas
- **Validação:** 1-2 horas

### Total Estimado
- **Mínimo:** 10 horas
- **Provável:** 15 horas
- **Máximo:** 20 horas

## Dependências

### Dependências Técnicas
- Ruby 3.x
- Rails 7.x
- RSpec Rails
- FactoryBot
- Faker

### Dependências de Conhecimento
- Entendimento de JWT authentication flow
- Conhecimento da arquitetura do Finance App
- Familiaridade com RSpec e testing patterns

## Documentação

### Documentos a Atualizar
1. `RSPEC_FIXES_SUMMARY.md` - adicionar novas correções
2. `README.md` - atualizar status dos testes
3. Comentários inline onde lógica for complexa

### Documentos a Criar
1. `tasks/corrigir-testes-rspec/techspec.md` - especificação técnica
2. `tasks/corrigir-testes-rspec/tasks.md` - lista de tarefas
3. Arquivos individuais de tarefas

## Apêndices

### A. Comandos Úteis
```bash
# Executar todos os testes
bundle exec rspec

# Executar testes de autenticação
bundle exec rspec spec/requests/api/v1/swagger/

# Executar testes de services
bundle exec rspec spec/services/

# Executar com formato detalhado
bundle exec rspec --format documentation

# Executar testes falhando
bundle exec rspec --only-failures
```

### B. Arquivos Críticos
```
app/controllers/api/v1/base_controller.rb
app/controllers/concerns/authenticable.rb
app/services/jwt_service.rb
app/services/dashboard_service.rb
app/services/transaction_filter_service.rb
app/services/category_statistics_service.rb
```

### C. Padrões de Teste Identificados
1. Bypass de validações: usar `update_column`
2. Comparação de valores: usar `.to_f` ou `.to_i`
3. Faker: preferir métodos que não dependem de i18n
4. Traits: usar `after(:create)` com `update_column`
