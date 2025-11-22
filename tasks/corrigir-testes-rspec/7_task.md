---
status: pending
parallelizable: true
blocked_by: ["3.0"]
---

<task_context>
<domain>backend/services</domain>
<type>implementation</type>
<scope>transaction_filter_service</scope>
<complexity>medium</complexity>
<dependencies>transaction|category|account</dependencies>
<unblocks>"9.0"</unblocks>
</task_context>

# Tarefa 7.0: Implementar Métodos Faltantes em TransactionFilterService

## Visão Geral
Implementar dois métodos faltantes no TransactionFilterService:
1. `search_suggestions` - retorna descrições que correspondem ao termo buscado
2. `filter_options` - retorna categorias e contas do usuário para UI de filtros

Resolve 3 testes do TransactionFilterService.

## Contexto
O TransactionFilterService já implementa o método principal `call` que filtra transações. Porém, faltam métodos auxiliares para melhorar a experiência do usuário na busca e filtragem.

## Requisitos
- [ ] Entendimento do TransactionFilterService existente
- [ ] Conhecimento de queries SQL e distinct
- [ ] Entendimento de API design para filter options

## Subtarefas

### 7.1 Analisar Testes Falhando
- spec/services/transaction_filter_service_spec.rb:286 (search_suggestions)
- spec/services/transaction_filter_service_spec.rb:254 (filter_options categories)
- spec/services/transaction_filter_service_spec.rb:262 (filter_options accounts)
- Documentar expected behavior

### 7.2 Analisar Estrutura Atual do Service
- Revisar base_scope e filtros existentes
- Verificar métodos privados disponíveis
- Identificar onde adicionar novos métodos

### 7.3 Implementar search_suggestions
- Retornar descrições únicas que correspondem ao termo
- Usar case-insensitive search
- Limitar resultados (ex: 5-10 sugestões)
- Ordenar por relevância

### 7.4 Implementar filter_options
- Retornar categorias do usuário (ativas)
- Retornar contas do usuário (ativas)
- Retornar tipos de transação disponíveis
- Retornar períodos predefinidos
- Formato adequado para UI

### 7.5 Validar Implementações
- Rodar os 3 testes específicos
- Rodar todos os testes do service
- Verificar performance das queries
- Validar formato de resposta

## Detalhes de Implementação

### Teste 1: search_suggestions (linha 286)

```ruby
it 'returns matching descriptions' do
  # Setup já criado no let:
  # - 'Salary Payment'
  # - 'Grocery Shopping'
  # - 'Restaurant Bill'
  # - 'Last Month Expense'

  service = described_class.new(user, { search: 'Grocery' })
  result = service.search_suggestions

  expect(result).to include('Grocery Shopping')
  expect(result).not_to include('Restaurant Bill')
end
```

### Teste 2 e 3: filter_options (linhas 254 e 262)

```ruby
it 'returns user categories' do
  service = described_class.new(user, {})
  result = service.filter_options

  expect(result[:categories]).to include(category1, category2)
end

it 'returns user accounts' do
  service = described_class.new(user, {})
  result = service.filter_options

  expect(result[:accounts]).to include(account)
end
```

### Implementação: search_suggestions

```ruby
# app/services/transaction_filter_service.rb

def search_suggestions(limit: 10)
  return [] if filters[:search].blank?

  search_term = filters[:search].downcase

  base_scope
    .where('LOWER(description) LIKE ?', "%#{search_term}%")
    .distinct
    .order(date: :desc)  # Mais recentes primeiro
    .limit(limit)
    .pluck(:description)
end
```

**Query SQL Gerada:**
```sql
SELECT DISTINCT "transactions"."description"
FROM "transactions"
WHERE "transactions"."user_id" = 1
  AND (LOWER(description) LIKE '%grocery%')
ORDER BY "transactions"."date" DESC
LIMIT 10
```

### Implementação: filter_options

```ruby
# app/services/transaction_filter_service.rb

def filter_options
  {
    categories: user.categories.active.order(:name),
    accounts: user.accounts.active.order(:name),
    transaction_types: ['income', 'expense', 'transfer'],
    periods: [
      { value: 'today', label: I18n.t('periods.today', default: 'Today') },
      { value: 'this_week', label: I18n.t('periods.this_week', default: 'This Week') },
      { value: 'this_month', label: I18n.t('periods.this_month', default: 'This Month') },
      { value: 'last_month', label: I18n.t('periods.last_month', default: 'Last Month') },
      { value: 'this_year', label: I18n.t('periods.this_year', default: 'This Year') },
      { value: 'custom', label: I18n.t('periods.custom', default: 'Custom') }
    ]
  }
end
```

**Formato de Resposta:**
```ruby
{
  categories: [
    #<Category id: 1, name: "Food", ...>,
    #<Category id: 2, name: "Transport", ...>
  ],
  accounts: [
    #<Account id: 1, name: "Checking", ...>,
    #<Account id: 2, name: "Savings", ...>
  ],
  transaction_types: ['income', 'expense', 'transfer'],
  periods: [
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    # ...
  ]
}
```

### Verificações de Scopes

Certificar que existem nos modelos:
```ruby
# app/models/category.rb
scope :active, -> { where(is_active: true) }

# app/models/account.rb
scope :active, -> { where(is_active: true) }
```

### Implementação Completa do Service (Referência)

```ruby
class TransactionFilterService
  attr_reader :user, :filters

  def initialize(user, filters = {})
    @user = user
    @filters = filters.with_indifferent_access
  end

  def call
    {
      transactions: filtered_transactions,
      meta: calculate_meta(filtered_transactions)
    }
  end

  def search_suggestions(limit: 10)
    return [] if filters[:search].blank?

    search_term = filters[:search].downcase

    base_scope
      .where('LOWER(description) LIKE ?', "%#{search_term}%")
      .distinct
      .order(date: :desc)
      .limit(limit)
      .pluck(:description)
  end

  def filter_options
    {
      categories: user.categories.active.order(:name),
      accounts: user.accounts.active.order(:name),
      transaction_types: ['income', 'expense', 'transfer'],
      periods: [
        { value: 'today', label: I18n.t('periods.today', default: 'Today') },
        { value: 'this_week', label: I18n.t('periods.this_week', default: 'This Week') },
        { value: 'this_month', label: I18n.t('periods.this_month', default: 'This Month') },
        { value: 'last_month', label: I18n.t('periods.last_month', default: 'Last Month') },
        { value: 'this_year', label: I18n.t('periods.this_year', default: 'This Year') },
        { value: 'custom', label: I18n.t('periods.custom', default: 'Custom') }
      ]
    }
  end

  private

  def base_scope
    user.transactions.includes(:category, :account)
  end

  # ... outros métodos privados existentes
end
```

## Critérios de Sucesso
- [ ] Método `search_suggestions` implementado e funcional
- [ ] Retorna descrições que correspondem ao termo buscado
- [ ] Case-insensitive search funciona
- [ ] Método `filter_options` implementado
- [ ] Retorna categorias ativas do usuário
- [ ] Retorna contas ativas do usuário
- [ ] Retorna tipos de transação e períodos
- [ ] Todos os 3 testes passam
- [ ] Todos os testes do TransactionFilterService passam
- [ ] Performance aceitável (queries otimizadas)

## Notas de Teste

### Comandos Úteis

```bash
# Testes específicos
bundle exec rspec spec/services/transaction_filter_service_spec.rb:286
bundle exec rspec spec/services/transaction_filter_service_spec.rb:254
bundle exec rspec spec/services/transaction_filter_service_spec.rb:262

# Todos os testes do service
bundle exec rspec spec/services/transaction_filter_service_spec.rb

# Com SQL logging
VERBOSE=true bundle exec rspec spec/services/transaction_filter_service_spec.rb:286
```

### Validação de Performance

```ruby
# No Rails console test
user = User.first
service = TransactionFilterService.new(user, { search: 'Grocery' })

# Verificar query
puts service.search_suggestions.to_sql

# Medir tempo
Benchmark.measure { service.search_suggestions }
```

## Referências
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md - Seções "Problema 5 e 6"
- [Rails Distinct] https://guides.rubyonrails.org/active_record_querying.html#distinct
