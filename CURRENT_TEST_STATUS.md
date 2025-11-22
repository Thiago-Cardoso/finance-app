# Status Atual dos Testes - Backend

**Data da última atualização:** 28/10/2025 - 21:15

## Resumo
- **Total de testes:** 478 examples
- **Testes falhando:** 14 failures (2.9%) ⬅️ PROGRESS! (começamos com 31)
- **Objetivo:** 0 failures

## 🎉 Correções Realizadas Nesta Sessão

### 1. TransactionFilterService (3 testes) ✅
**Arquivos modificados:**
- `app/services/transaction_filter_service.rb` (linhas 39-40)
- `app/models/transaction.rb` (linhas 36-39)

**Mudanças:**
- Adicionado `.to_a` para converter ActiveRecord relations em arrays
- Mudado de `where('description % ?', query)` para `where('description ILIKE ?', "%#{query}%")`

### 2. Handlers de Erro 404 (17 testes) ✅
**Arquivos modificados:**
- `app/controllers/application_controller.rb` (mantido StandardError handler)
- `app/controllers/api/v1/base_controller.rb` (linhas 14-21)

**Mudanças:**
- Adicionado rescue_from específicos no BaseController que sobrescrevem os do ApplicationController
- `rescue_from ActiveRecord::RecordNotFound, with: :render_not_found`
- `rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors`
- **Removido** o `rescue_from StandardError` do BaseController (deixado apenas no ApplicationController)

**Insight técnico:** Em Rails, rescue_from em subclasses tem precedência, mas StandardError captura TODAS as exceções. A solução foi declarar handlers específicos na subclasse sem redeclarar StandardError.

### 3. Frontend - GoalsProgress Component ✅
**Arquivo:** `frontend/src/components/dashboard/GoalsProgress.tsx`
**Mudanças:**
- Linha 7: Interface `title: string` → `name: string`
- Linha 98: `{goal.title}` → `{goal.name}`

### 4. Category - Prevent Deletion with Transactions (1 teste) ✅
**Arquivo:** `app/models/category.rb` (linha 10)
**Mudanças:**
- `has_many :transactions, dependent: :nullify` → `has_many :transactions, dependent: :restrict_with_error`

### 5. Goals - Método is_on_track? (Bug de produção) ✅
**Arquivo:** `app/models/goal.rb` (linhas 97-108)
**Problema:** GET /api/v1/goals retornava 500 error
**Mudanças:**
- Adicionado método `is_on_track?` que estava sendo chamado pelo controller mas não existia
- Método calcula se a meta está no caminho certo baseado no progresso esperado vs atual
- **Testado com Playwright:** Página de metas agora carrega corretamente!
- Screenshot: `.playwright-mcp/goals-page-fixed.png`

## 14 Testes Falhando - Análise

### Grupo 1: Analytics - Validação de parâmetros (4 testes)
1. `spec/requests/api/v1/swagger/analytics_spec.rb:41` - Parâmetros inválidos (422)
2. `spec/requests/api/v1/swagger/analytics_spec.rb:158` - Erro ao gerar relatório (422)
3. `spec/requests/api/v1/swagger/analytics_spec.rb:95` - Budget performance parâmetros inválidos (422)
4. `spec/requests/api/v1/swagger/analytics_spec.rb:193` - Lista de relatórios (200)

### Grupo 2: Dashboard - Problemas de tipo (String vs Float) (5 testes)
5. `spec/requests/api/v1/dashboard_spec.rb:68` - returns correct total balance
   - **Problema:** Espera Float, recebe String
6. `spec/requests/api/v1/dashboard_spec.rb:114` - returns budget status
   - **Problema:** `percentage_used` espera 70.0, recebe "70.0"
7. `spec/requests/api/v1/dashboard_spec.rb:88` - returns top categories
   - **Problema:** `percentage` espera 50.0, recebe "50.0"
8. `spec/requests/api/v1/dashboard_spec.rb:188` - caching uses cache for repeated requests
9. `spec/requests/api/v1/dashboard_spec.rb:136` - returns goals progress

### Grupo 3: DashboardService (2 testes)
10. `spec/services/dashboard_service_spec.rb:87` - total_balance sums only active accounts
11. `spec/services/dashboard_service_spec.rb:331` - goals_progress handles zero target amount

### Grupo 4: Categories (2 testes)
12. `spec/requests/api/v1/categories_spec.rb:328` - includes category trends
    - **Problema:** Espera `category_trends` presente, mas está vazio
13. `spec/requests/api/v1/categories_spec.rb:219` - prevents deletion of categories with transactions
    - **Nota:** Passa quando testado individualmente! Pode ser problema de isolamento de testes

### Grupo 5: Transactions (1 teste)
14. `spec/requests/api/v1/transactions_spec.rb:36` - filters transactions by date range
    - **Problema:** old_transaction está sendo incluído quando não deveria

## Próximos Passos

### Prioridade Alta (Dashboard - tipo de dados)
Os 5 testes de Dashboard tem o mesmo problema: serialização retornando Strings em vez de Floats/Numbers.
- Investigar DashboardSerializer ou resposta JSON
- Provavelmente precisa usar `.to_f` nos campos numéricos

### Prioridade Média (Analytics)
- 4 testes relacionados a validação de parâmetros
- Verificar AnalyticsController validations

### Prioridade Média (DashboardService)
- 2 testes de lógica de negócio
- Verificar cálculos e filtros

### Prioridade Baixa
- 1 teste de category_trends (statistics)
- 1 teste de date_range filter

## Comandos Úteis

```bash
# Testar um spec específico
bundle exec rspec spec/requests/api/v1/dashboard_spec.rb:68

# Testar todos os failing
bundle exec rspec --only-failures

# Ver falhas com detalhes
bundle exec rspec --format documentation --only-failures

# Rodar suite completa
bundle exec rspec
```

## Progresso

- ✅ Início: 478 examples, 31 failures (6.5%)
- ✅ Agora: 478 examples, 14 failures (2.9%)
- 🎯 Meta: 478 examples, 0 failures (0%)
- **Redução de 55% nos failures!**
- **Bug de produção corrigido:** Goals page 500 error
