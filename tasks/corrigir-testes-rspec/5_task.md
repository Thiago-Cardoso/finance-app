---
status: pending
parallelizable: true
blocked_by: ["3.0"]
---

<task_context>
<domain>backend/services</domain>
<type>implementation</type>
<scope>dashboard_service_budget</scope>
<complexity>medium</complexity>
<dependencies>active_record|budget|transactions</dependencies>
<unblocks>"9.0"</unblocks>
</task_context>

# Tarefa 5.0: Corrigir DashboardService - budget_status (Filtros e Cálculos)

## Visão Geral
Corrigir o método `budget_status` no DashboardService para:
1. Retornar apenas budgets ativos no período atual
2. Calcular valores gastos corretamente (filtrar por período e usuário)
3. Determinar status correto (ok/warning/exceeded) com threshold adequado

Resolve 3 testes do DashboardService.

## Contexto
O método `budget_status` tem 3 problemas principais:
1. Retorna todos os budgets ao invés de apenas os ativos no período atual
2. Cálculo de "spent" não filtra por período do budget
3. Threshold de "warning" está incorreto (deve ser 80%, não 90%)

## Requisitos
- [ ] Entendimento do modelo Budget e suas relações
- [ ] Conhecimento de date ranges e queries de período
- [ ] Compreensão da lógica de status de budget
- [ ] Acesso ao DashboardService

## Subtarefas

### 5.1 Analisar Testes Falhando
- Executar spec/services/dashboard_service_spec.rb:208 (returns current active budgets)
- Executar spec/services/dashboard_service_spec.rb:223 (calculates spent amount)
- Executar spec/services/dashboard_service_spec.rb:242 (determines status)
- Documentar expected vs actual para cada teste
- Entender setup de cada teste

### 5.2 Analisar Implementação Atual
- Ler método `budget_status`
- Ler método helper `format_budget_status`
- Verificar query inicial de budgets
- Verificar cálculo de spent
- Verificar lógica de status
- Documentar problemas encontrados

### 5.3 Criar/Verificar Scope active_in_period no Budget
- Verificar se scope existe em Budget model
- Se não existe, criar scope
- Testar scope com diferentes datas
- Validar query SQL gerada

### 5.4 Corrigir Filtro de Budgets Ativos
- Modificar query inicial para usar scope active_in_period
- Passar período correto (Date.current)
- Testar que retorna apenas budgets do período

### 5.5 Corrigir Cálculo de Spent Amount
- Modificar cálculo para filtrar transações por:
  - Usuário (user)
  - Tipo (expense)
  - Período (start_date..end_date do budget)
- Considerar usar método do Budget model se existir
- Validar cálculo com testes

### 5.6 Corrigir Threshold de Status
- Mudar threshold de warning de 90% para 80%
- Validar lógica:
  - >= 100%: exceeded
  - >= 80%: warning
  - < 80%: ok

### 5.7 Validar Todas as Correções
- Rodar os 3 testes específicos
- Rodar todos os testes de dashboard_service_spec.rb
- Verificar integração com outros métodos
- Validar formato de resposta

## Sequenciamento
- **Bloqueado por:** 3.0 (Autenticação)
- **Desbloqueia:** 9.0 (Validação final)
- **Paralelizável:** Sim - pode rodar em paralelo com 4.0, 6.0, 7.0, 8.0

## Detalhes de Implementação

### Arquivos a Modificar

```
app/services/dashboard_service.rb
app/models/budget.rb (criar/verificar scope e método calculate_spent)
```

### Teste 1: Returns current active budgets (linha 208)

```ruby
it 'returns current active budgets' do
  # Budget no mês atual
  budget1 = create(:budget, user: user,
                   start_date: Date.current.beginning_of_month,
                   end_date: Date.current.end_of_month,
                   amount: 500)

  # Budget no mês passado
  budget2 = create(:budget, user: user,
                   start_date: 1.month.ago.beginning_of_month,
                   end_date: 1.month.ago.end_of_month,
                   amount: 300)

  result = service.send(:budget_status)

  expect(result.size).to eq(1)  # Apenas budget1
  expect(result.first[:id]).to eq(budget1.id)
end
```

**Problema:** Retorna ambos os budgets (size == 2)
**Solução:** Filtrar por período

### Teste 2: Calculates spent amount (linha 223)

```ruby
it 'calculates spent amount correctly' do
  budget = create(:budget, user: user, category: category_expense,
                  amount: 500,
                  start_date: Date.current.beginning_of_month,
                  end_date: Date.current.end_of_month)

  # Transações no período do budget
  create(:transaction, :expense, user: user, category: category_expense,
         account: account, amount: 150, date: Date.current)
  create(:transaction, :expense, user: user, category: category_expense,
         account: account, amount: 75, date: Date.current)

  # Transação fora do período (não deve contar)
  create(:transaction, :expense, user: user, category: category_expense,
         account: account, amount: 100, date: 2.months.ago)

  result = service.send(:budget_status)
  budget_data = result.find { |b| b[:id] == budget.id }

  expect(budget_data[:spent]).to eq(225.0)  # 150 + 75 (não inclui 100)
end
```

**Problema:** spent pode estar incluindo transações fora do período
**Solução:** Filtrar transações por date range do budget

### Teste 3: Determines status correctly (linha 242)

```ruby
it 'determines budget status correctly' do
  # Budget OK: 200 de 500 = 40%
  budget_ok = create(:budget, ...)
  create(:transaction, :expense, amount: 200, ...)  # 40%

  # Budget Warning: 170 de 200 = 85%
  budget_warning = create(:budget, ...)
  create(:transaction, :expense, amount: 170, ...)  # 85%

  # Budget Exceeded: 120 de 100 = 120%
  budget_exceeded = create(:budget, ...)
  create(:transaction, :expense, amount: 120, ...)  # 120%

  result = service.send(:budget_status)

  expect(result.find { |b| b[:id] == budget_ok.id }[:status]).to eq('ok')
  expect(result.find { |b| b[:id] == budget_warning.id }[:status]).to eq('warning')
  expect(result.find { |b| b[:id] == budget_exceeded.id }[:status]).to eq('exceeded')
end
```

**Problema:** 85% retorna 'ok' ao invés de 'warning'
**Causa:** Threshold está em 90% ao invés de 80%
**Solução:** Mudar threshold

### Implementação Atual (Problemas)

```ruby
def budget_status
  user.budgets  # ❌ Retorna TODOS os budgets
    .includes(:category)
    .map { |budget| format_budget_status(budget) }
end

private

def format_budget_status(budget)
  # ❌ Pega TODAS as transações da categoria, sem filtrar por período
  spent = budget.category.transactions
    .where(transaction_type: 'expense')
    .sum(:amount).to_f

  percentage_used = (spent / budget.amount * 100).round(2)

  # ❌ Threshold incorreto (90% ao invés de 80%)
  status = if percentage_used >= 100
             'exceeded'
           elsif percentage_used >= 90  # ❌ Deveria ser 80
             'warning'
           else
             'ok'
           end

  {
    id: budget.id,
    category_name: budget.category.name,
    limit: budget.amount,
    spent: spent,
    # ... resto dos campos
    status: status
  }
end
```

### Solução Proposta

**1. Criar/Verificar Scope em Budget:**
```ruby
# app/models/budget.rb
class Budget < ApplicationRecord
  belongs_to :user
  belongs_to :category

  scope :active_in_period, ->(date = Date.current) {
    where('start_date <= ? AND end_date >= ?', date, date)
  }

  # Método helper para calcular spent
  def calculate_spent
    category.transactions
      .where(user: user, transaction_type: 'expense')
      .where('date >= ? AND date <= ?', start_date, end_date)
      .sum(:amount)
  end
end
```

**2. Corrigir DashboardService:**
```ruby
def budget_status
  user.budgets
    .active_in_period(Date.current)  # ✅ Apenas budgets do período atual
    .includes(:category)
    .map { |budget| format_budget_status(budget) }
end

private

def format_budget_status(budget)
  # ✅ Usa método do modelo OU query correta
  spent = if budget.respond_to?(:calculate_spent)
            budget.calculate_spent.to_f
          else
            budget.category.transactions
              .where(user: user, transaction_type: 'expense')
              .where('date >= ? AND date <= ?', budget.start_date, budget.end_date)
              .sum(:amount).to_f
          end

  percentage_used = (spent / budget.amount * 100).round(2)

  # ✅ Threshold correto
  status = if percentage_used >= 100
             'exceeded'
           elsif percentage_used >= 80  # ✅ Corrigido para 80%
             'warning'
           else
             'ok'
           end

  {
    id: budget.id,
    category_name: budget.category.name,
    limit: budget.amount,
    spent: spent,
    remaining: (budget.amount - spent).round(2),
    percentage_used: percentage_used,
    formatted_limit: format_currency(budget.amount),
    formatted_spent: format_currency(spent),
    formatted_remaining: format_currency(budget.amount - spent),
    status: status
  }
end
```

### Queries SQL

**Scope active_in_period:**
```sql
SELECT "budgets".*
FROM "budgets"
WHERE "budgets"."user_id" = 1
  AND (start_date <= '2025-10-28' AND end_date >= '2025-10-28')
```

**Calculate spent:**
```sql
SELECT SUM("transactions"."amount")
FROM "transactions"
WHERE "transactions"."category_id" = 1
  AND "transactions"."user_id" = 1
  AND "transactions"."transaction_type" = 'expense'
  AND (date >= '2025-10-01' AND date <= '2025-10-31')
```

## Critérios de Sucesso
- [ ] Teste linha 208 passa (returns current active budgets)
- [ ] Teste linha 223 passa (calculates spent amount)
- [ ] Teste linha 242 passa (determines status correctly)
- [ ] Scope active_in_period funciona corretamente
- [ ] Cálculo de spent filtra por período e usuário
- [ ] Threshold de warning é 80%
- [ ] Todos os testes de dashboard_service_spec.rb passam
- [ ] Nenhum teste anterior quebrou

## Notas de Teste

### Comandos Úteis

```bash
# Testes específicos
bundle exec rspec spec/services/dashboard_service_spec.rb:208
bundle exec rspec spec/services/dashboard_service_spec.rb:223
bundle exec rspec spec/services/dashboard_service_spec.rb:242

# Todos juntos
bundle exec rspec spec/services/dashboard_service_spec.rb:208,223,242

# Todos os testes do service
bundle exec rspec spec/services/dashboard_service_spec.rb
```

### Validação de Cálculos

| Budget Amount | Spent | Percentage | Expected Status |
|--------------|-------|------------|-----------------|
| 500 | 200 | 40% | ok |
| 500 | 390 | 78% | ok |
| 500 | 400 | 80% | warning |
| 500 | 450 | 90% | warning |
| 500 | 500 | 100% | exceeded |
| 500 | 550 | 110% | exceeded |

## Referências
- [PRD] tasks/corrigir-testes-rspec/prd.md
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md - Seção "Problema 3"
- [Budget Logic] Documentação de regras de negócio
