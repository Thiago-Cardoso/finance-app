# Especificação Técnica: Correção dos 77 Testes Falhando do RSpec

## Visão Geral

Este documento detalha a abordagem técnica para corrigir os 77 testes falhando na suite RSpec do Finance App Backend, focando em 4 categorias principais de problemas.

## Arquitetura Atual

### Hierarquia de Controllers
```
ApplicationController (ActionController::API)
└── Api::V1::BaseController
    ├── include Authenticable
    ├── include Paginable
    ├── include Localizable
    └── before_action :authenticate_user!
```

### Fluxo de Autenticação
```
Request → Authorization Header → Authenticable#authenticate_user!
→ JwtService.decode → User.find_by → @current_user
```

### Tratamento de Exceções
```ruby
# Api::V1::BaseController
rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors
rescue_from JwtService::TokenExpiredError, with: :render_token_expired
rescue_from JwtService::TokenInvalidError, with: :render_unauthorized
rescue_from StandardError, with: :render_internal_server_error
```

## Análise dos Problemas

### Problema 1: Autenticação Retornando 500 ao Invés de 401

#### Causa Raiz
O concern `Authenticable` lança `JwtService::TokenInvalidError`, que deveria ser capturado pelo `rescue_from` no `BaseController`. No entanto, em alguns cenários, a exceção está sendo capturada pelo `rescue_from StandardError` antes de chegar ao handler específico.

#### Cenários Problemáticos
1. **Token ausente:** `authenticate_user!` lança exceção mas é capturada como StandardError
2. **Token inválido:** Decode falha mas exceção não é propagada corretamente
3. **Usuário não encontrado:** Query retorna nil mas não há tratamento adequado

#### Análise de Código

**Authenticable Concern (app/controllers/concerns/authenticable.rb):**
```ruby
def authenticate_user!
  token = extract_token_from_header
  raise JwtService::TokenInvalidError, 'Token not provided' unless token  # ✅ Correto

  payload = JwtService.decode(token)  # ⚠️ Pode lançar outras exceções
  @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])

  raise JwtService::TokenInvalidError, 'User not found' unless @current_user  # ✅ Correto
end
```

**JwtService (app/services/jwt_service.rb):**
```ruby
def self.decode(token)
  JWT.decode(token, secret_key, true, algorithm: 'HS256')[0].symbolize_keys
rescue JWT::ExpiredSignature
  raise TokenExpiredError, 'Token has expired'
rescue JWT::DecodeError => e
  raise TokenInvalidError, "Invalid token: #{e.message}"  # ⚠️ Verificar se isso está funcionando
end
```

#### Solução Proposta

**Opção 1: Garantir Ordem de Rescue (Recomendada)**
```ruby
# Api::V1::BaseController
rescue_from JwtService::TokenExpiredError, with: :render_token_expired
rescue_from JwtService::TokenInvalidError, with: :render_unauthorized
rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
rescue_from ActiveRecord::RecordInvalid, with: :render_validation_errors
rescue_from StandardError, with: :render_internal_server_error  # Deve ser o último
```

**Opção 2: Tratar Explicitamente no Authenticable**
```ruby
def authenticate_user!
  token = extract_token_from_header
  return render_unauthorized unless token

  begin
    payload = JwtService.decode(token)
    @current_user = User.find_by(id: payload[:user_id], jti: payload[:jti])
    return render_unauthorized unless @current_user
  rescue JwtService::TokenExpiredError
    render_token_expired
  rescue JwtService::TokenInvalidError
    render_unauthorized
  end
end
```

**Decisão:** Opção 1 + Verificação do JwtService

### Problema 2: DashboardService - Total Balance

#### Teste Falhando
```ruby
# spec/services/dashboard_service_spec.rb:87
it 'sums only active accounts' do
  create(:account, user: user, current_balance: 500, is_active: true)
  create(:account, user: user, current_balance: 200, is_active: false)

  result = service.send(:total_balance)

  expect(result).to eq(1500.0) # 1000 + 500 (excluding inactive)
end
```

#### Causa Provável
```ruby
# app/services/dashboard_service.rb
def total_balance
  user.accounts.sum(:current_balance).to_f  # ❌ Não filtra por is_active
end
```

#### Solução
```ruby
def total_balance
  user.accounts.active.sum(:current_balance).to_f  # ✅ Usa scope active
end

# Verificar se scope existe em Account model:
# app/models/account.rb
scope :active, -> { where(is_active: true) }
```

### Problema 3: DashboardService - Budget Status

#### Testes Falhando
1. **Returns current active budgets** (linha 208)
2. **Calculates spent amount correctly** (linha 223)
3. **Determines budget status correctly** (linha 242)

#### Análise

**Teste 1: Returns current active budgets**
```ruby
it 'returns current active budgets' do
  budget1 = create(:budget, user: user, start_date: Date.current.beginning_of_month,
                   end_date: Date.current.end_of_month, amount: 500)
  budget2 = create(:budget, user: user, start_date: 1.month.ago.beginning_of_month,
                   end_date: 1.month.ago.end_of_month, amount: 300)

  result = service.send(:budget_status)

  expect(result.size).to eq(1)  # Apenas budget1
  expect(result.first[:id]).to eq(budget1.id)
end
```

**Causa Provável:**
```ruby
def budget_status
  user.budgets  # ❌ Retorna todos os budgets
    .includes(:category)
    .map { |budget| format_budget_status(budget) }
end
```

**Solução:**
```ruby
def budget_status
  user.budgets.active_in_period(Date.current)  # ✅ Filtra por período atual
    .includes(:category)
    .map { |budget| format_budget_status(budget) }
end

# app/models/budget.rb
scope :active_in_period, ->(date = Date.current) {
  where('start_date <= ? AND end_date >= ?', date, date)
}
```

**Teste 2: Calculates spent amount correctly**
```ruby
it 'calculates spent amount correctly' do
  budget = create(:budget, user: user, category: category_expense,
                  amount: 500, start_date: Date.current.beginning_of_month,
                  end_date: Date.current.end_of_month)

  create(:transaction, :expense, user: user, category: category_expense,
         account: account, amount: 150, date: Date.current)
  create(:transaction, :expense, user: user, category: category_expense,
         account: account, amount: 75, date: Date.current)

  result = service.send(:budget_status)
  budget_data = result.find { |b| b[:id] == budget.id }

  expect(budget_data[:spent]).to eq(225.0)  # 150 + 75
end
```

**Causa Provável:**
```ruby
def format_budget_status(budget)
  spent = budget.category.transactions  # ❌ Pega todas as transações da categoria
    .where(transaction_type: 'expense')
    .sum(:amount).to_f

  # ...
end
```

**Solução:**
```ruby
def format_budget_status(budget)
  # ✅ Filtra por período do budget E usuário
  spent = budget.category.transactions
    .where(user: user, transaction_type: 'expense')
    .where('date >= ? AND date <= ?', budget.start_date, budget.end_date)
    .sum(:amount).to_f

  # Ou usar método do modelo:
  spent = budget.calculate_spent.to_f  # Se existir no Budget model

  # ...
end
```

**Teste 3: Determines budget status correctly**
```ruby
it 'determines budget status correctly' do
  budget_ok = create(:budget, user: user, category: category_expense,
                     amount: 500, start_date: Date.current.beginning_of_month,
                     end_date: Date.current.end_of_month)
  budget_warning = create(:budget, user: user, category: category2,
                          amount: 200, start_date: Date.current.beginning_of_month,
                          end_date: Date.current.end_of_month)
  budget_exceeded = create(:budget, user: user, category: category3,
                           amount: 100, start_date: Date.current.beginning_of_month,
                           end_date: Date.current.end_of_month)

  # Criar transações
  create(:transaction, :expense, user: user, category: category_expense,
         account: account, amount: 200, date: Date.current)  # 40% - ok
  create(:transaction, :expense, user: user, category: category2,
         account: account, amount: 170, date: Date.current)  # 85% - warning
  create(:transaction, :expense, user: user, category: category3,
         account: account, amount: 120, date: Date.current)  # 120% - exceeded

  result = service.send(:budget_status)

  ok_budget = result.find { |b| b[:id] == budget_ok.id }
  warning_budget = result.find { |b| b[:id] == budget_warning.id }
  exceeded_budget = result.find { |b| b[:id] == budget_exceeded.id }

  expect(ok_budget[:status]).to eq('ok')
  expect(warning_budget[:status]).to eq('warning')
  expect(exceeded_budget[:status]).to eq('exceeded')
end
```

**Causa Provável:**
```ruby
def format_budget_status(budget)
  # ...
  percentage_used = (spent / budget.amount * 100).round(2)

  status = if percentage_used >= 100
             'exceeded'
           elsif percentage_used >= 90  # ❌ Threshold incorreto
             'warning'
           else
             'ok'
           end

  # ...
end
```

**Solução:**
```ruby
def format_budget_status(budget)
  # ...
  percentage_used = (spent / budget.amount * 100).round(2)

  # ✅ Threshold correto: warning >= 80%
  status = if percentage_used >= 100
             'exceeded'
           elsif percentage_used >= 80  # Corrigido para 80%
             'warning'
           else
             'ok'
           end

  # ...
end
```

### Problema 4: DashboardService - Goals Progress

#### Testes Falhando
Testes relacionados a `goals_progress` (detalhes dependem dos erros específicos)

#### Verificações Necessárias
1. Usar `goal.name` ao invés de `goal.title`
2. Usar scope `.active` ao invés de `where(is_achieved: false)`
3. Usar `goal.progress_percentage` ao invés de `goal.percentage_achieved`
4. Usar `goal.monthly_target` ao invés de `goal.suggested_monthly_contribution`
5. Usar `goal.status == 'completed'` ao invés de `goal.is_achieved`

#### Solução
```ruby
def goals_progress
  user.goals.active  # ✅ Usa scope correto
    .includes(:transactions)
    .limit(5)
    .map do |goal|
      {
        id: goal.id,
        name: goal.name,  # ✅ Atributo correto
        target_amount: format_currency(goal.target_amount),
        current_amount: format_currency(goal.current_amount),
        progress_percentage: goal.progress_percentage,  # ✅ Método correto
        target_date: goal.target_date,
        days_remaining: goal.days_remaining,
        monthly_target: format_currency(goal.monthly_target),  # ✅ Método correto
        status: goal.status  # ✅ Atributo correto
      }
    end
end
```

### Problema 5: TransactionFilterService - Search Suggestions

#### Teste Falhando
```ruby
# spec/services/transaction_filter_service_spec.rb:286
it 'returns matching descriptions' do
  service = described_class.new(user, { search: 'Grocery' })
  result = service.search_suggestions

  expect(result).to include('Grocery Shopping')
  expect(result).not_to include('Restaurant Bill')
end
```

#### Causa
Método `search_suggestions` não implementado

#### Solução
```ruby
# app/services/transaction_filter_service.rb
def search_suggestions(limit: 5)
  return [] if filters[:search].blank?

  base_scope
    .where('LOWER(description) LIKE ?', "%#{filters[:search].downcase}%")
    .distinct
    .pluck(:description)
    .first(limit)
end
```

### Problema 6: TransactionFilterService - Filter Options

#### Testes Falhando
```ruby
# spec/services/transaction_filter_service_spec.rb:254
it 'returns user categories' do
  service = described_class.new(user, {})
  result = service.filter_options

  expect(result[:categories]).to include(category1, category2)
end

# spec/services/transaction_filter_service_spec.rb:262
it 'returns user accounts' do
  service = described_class.new(user, {})
  result = service.filter_options

  expect(result[:accounts]).to include(account)
end
```

#### Causa
Método `filter_options` não implementado ou incompleto

#### Solução
```ruby
# app/services/transaction_filter_service.rb
def filter_options
  {
    categories: user.categories.active.order(:name),
    accounts: user.accounts.active.order(:name),
    transaction_types: ['income', 'expense', 'transfer'],
    periods: [
      { value: 'today', label: 'Hoje' },
      { value: 'this_week', label: 'Esta Semana' },
      { value: 'this_month', label: 'Este Mês' },
      { value: 'last_month', label: 'Mês Passado' },
      { value: 'this_year', label: 'Este Ano' },
      { value: 'custom', label: 'Personalizado' }
    ]
  }
end
```

### Problema 7: CategoryStatisticsService

#### Análise Necessária
Precisa de detalhes específicos dos testes falhando. Provavelmente envolve:
1. Cálculos de estatísticas (soma, média, comparações)
2. Trends (comparação período atual vs anterior)
3. Formatação de valores

#### Abordagem
1. Executar testes específicos com `--format documentation`
2. Identificar expectativas vs resultados reais
3. Corrigir cálculos e queries

### Problema 8: Categories - Prevent Deletion

#### Teste Provável
```ruby
it 'prevents deletion of categories with transactions' do
  category = create(:category, user: user)
  create(:transaction, user: user, category: category)

  expect { category.destroy }.to raise_error(ActiveRecord::InvalidForeignKey)
  # OU
  expect(category.destroy).to be_falsey
  expect(category.errors[:base]).to include('Cannot delete category with transactions')
end
```

#### Solução
```ruby
# app/models/category.rb
before_destroy :check_for_transactions

private

def check_for_transactions
  if transactions.exists?
    errors.add(:base, 'Cannot delete category with existing transactions')
    throw(:abort)
  end
end
```

## Estratégia de Implementação

### Fase 1: Investigação Detalhada
1. Executar cada teste falhando individualmente
2. Capturar logs e stacktraces completos
3. Documentar expectativas vs realidade
4. Identificar padrões comuns

### Fase 2: Correção de Autenticação
1. Verificar ordem de `rescue_from` em BaseController
2. Adicionar logs em Authenticable para debug
3. Testar com diferentes cenários (sem token, token inválido, token expirado)
4. Validar todos os swagger specs de autenticação

### Fase 3: Correção de DashboardService
1. Corrigir `total_balance` (adicionar filtro `.active`)
2. Corrigir `budget_status` (filtrar por período, usuário, calcular spent)
3. Corrigir `goals_progress` (usar atributos/métodos corretos)
4. Validar com testes do service

### Fase 4: Correção de TransactionFilterService
1. Implementar `search_suggestions`
2. Implementar/corrigir `filter_options`
3. Validar com testes do service

### Fase 5: Correção de CategoryStatisticsService
1. Executar testes e analisar falhas
2. Corrigir cálculos conforme necessário
3. Validar trends e formatações

### Fase 6: Validação Completa
1. Executar suite completa múltiplas vezes
2. Testar com diferentes seeds
3. Verificar CI/CD
4. Atualizar documentação

## Comandos de Teste

### Testes Específicos
```bash
# Autenticação
bundle exec rspec spec/requests/api/v1/swagger/dashboard_spec.rb:25
bundle exec rspec spec/requests/api/v1/swagger/categories_spec.rb -e "não autorizado"

# DashboardService
bundle exec rspec spec/services/dashboard_service_spec.rb:87
bundle exec rspec spec/services/dashboard_service_spec.rb:208
bundle exec rspec spec/services/dashboard_service_spec.rb:223

# TransactionFilterService
bundle exec rspec spec/services/transaction_filter_service_spec.rb:286
bundle exec rspec spec/services/transaction_filter_service_spec.rb:254

# CategoryStatisticsService
bundle exec rspec spec/services/category_statistics_service_spec.rb

# Suite completa
bundle exec rspec --format documentation --format html --out tmp/rspec_results.html
```

### Debug
```bash
# Com logs
RAILS_ENV=test LOG_LEVEL=debug bundle exec rspec spec/path/to/spec.rb

# Com pry
# Adicionar 'binding.pry' no código e rodar:
bundle exec rspec spec/path/to/spec.rb

# Apenas falhas
bundle exec rspec --only-failures

# Com seed específico
bundle exec rspec --seed 12345
```

## Checklist de Validação

### Para Cada Correção
- [ ] Teste específico passa
- [ ] Testes relacionados continuam passando
- [ ] Não há novos warnings
- [ ] Código segue padrões do projeto
- [ ] Commit descritivo criado

### Antes de Finalizar
- [ ] Todos os 77 testes passando
- [ ] Suite completa passa (478/478)
- [ ] Testado com múltiplos seeds
- [ ] CI/CD verde
- [ ] RSPEC_FIXES_SUMMARY.md atualizado
- [ ] README.md atualizado

## Arquivos Críticos

### Controllers
- `app/controllers/api/v1/base_controller.rb`
- `app/controllers/concerns/authenticable.rb`
- `app/controllers/api/v1/*_controller.rb`

### Services
- `app/services/jwt_service.rb`
- `app/services/dashboard_service.rb`
- `app/services/transaction_filter_service.rb`
- `app/services/category_statistics_service.rb`

### Models
- `app/models/account.rb`
- `app/models/budget.rb`
- `app/models/goal.rb`
- `app/models/category.rb`

### Specs
- `spec/requests/api/v1/swagger/*_spec.rb`
- `spec/services/*_spec.rb`
- `spec/support/auth_helpers.rb`

## Decisões Técnicas

### DT1: Ordem de Rescue
**Decisão:** `rescue_from` mais específico primeiro, `StandardError` por último
**Razão:** Rails processa rescue_from na ordem inversa da definição
**Impacto:** 60 testes de autenticação

### DT2: Scopes vs Queries Inline
**Decisão:** Usar scopes quando disponíveis (`.active`, `.active_in_period`)
**Razão:** Mais legível, reutilizável, testável
**Impacto:** DashboardService e TransactionFilterService

### DT3: Métodos do Modelo vs Cálculos no Service
**Decisão:** Preferir métodos do modelo quando lógica é específica do domínio
**Razão:** Single Responsibility, testabilidade
**Impacto:** Budget.calculate_spent, Goal.progress_percentage

### DT4: Validações vs Callbacks
**Decisão:** Usar `before_destroy` callback para prevenir deleção
**Razão:** Permite mensagem de erro customizada
**Impacto:** Category model
