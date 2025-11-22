---
status: pending
parallelizable: true
blocked_by: ["3.0"]
---

<task_context>
<domain>backend/services_models</domain>
<type>implementation</type>
<scope>category_statistics</scope>
<complexity>medium</complexity>
<dependencies>category|transaction|statistics</dependencies>
<unblocks>"9.0"</unblocks>
</task_context>

# Tarefa 8.0: Corrigir CategoryStatisticsService e Validações de Category

## Visão Geral
Corrigir problemas no CategoryStatisticsService (cálculos de estatísticas e trends) e implementar validação para prevenir deleção de categorias com transações associadas. Resolve ~8 testes.

## Contexto
Esta tarefa requer investigação detalhada dos testes falhando para identificar problemas específicos de cálculo, formatação ou validação.

## Requisitos
- [ ] Entendimento de cálculos estatísticos
- [ ] Conhecimento de trends (comparação de períodos)
- [ ] Compreensão de callbacks do ActiveRecord
- [ ] Acesso aos testes específicos

## Subtarefas

### 8.1 Executar e Analisar Todos os Testes Falhando
- Rodar spec/services/category_statistics_service_spec.rb
- Rodar spec/models/category_spec.rb (se houver testes falhando)
- Listar todos os testes falhando com detalhes
- Anotar expected vs actual
- Identificar padrões de falha

### 8.2 Corrigir Cálculos de Estatísticas
- Identificar cálculos incorretos (soma, média, etc)
- Verificar filtros de período
- Verificar filtros de tipo de transação
- Corrigir queries SQL
- Validar resultados

### 8.3 Corrigir Trends
- Verificar comparação de período atual vs anterior
- Corrigir cálculo de variação percentual
- Corrigir determinação de trend (up/down/stable)
- Validar lógica de thresholds

### 8.4 Corrigir Formatação de Valores
- Verificar conversão BigDecimal → Float
- Verificar arredondamento
- Verificar currency formatting
- Validar formato de resposta

### 8.5 Implementar Prevenção de Deleção de Categoria com Transações
- Adicionar callback before_destroy no Category model
- Verificar se categoria tem transações
- Retornar erro apropriado se houver transações
- Adicionar testes para validação

### 8.6 Validar Todas as Correções
- Rodar todos os testes do CategoryStatisticsService
- Rodar testes do Category model
- Verificar integração
- Validar que nada quebrou

## Detalhes de Implementação

### Arquivos a Modificar

```
app/services/category_statistics_service.rb
app/models/category.rb
spec/models/category_spec.rb (verificar)
```

### Prevenção de Deleção (Implementação Comum)

```ruby
# app/models/category.rb
class Category < ApplicationRecord
  belongs_to :user
  has_many :transactions, dependent: :restrict_with_error

  before_destroy :check_for_transactions

  private

  def check_for_transactions
    if transactions.exists?
      errors.add(:base, I18n.t('errors.messages.category_has_transactions',
                               default: 'Cannot delete category with existing transactions'))
      throw(:abort)
    end
  end
end
```

**OU usar dependent:**

```ruby
# app/models/category.rb
class Category < ApplicationRecord
  belongs_to :user
  # Esta opção adiciona erro automaticamente
  has_many :transactions, dependent: :restrict_with_error
end
```

### Teste de Validação de Deleção

```ruby
# spec/models/category_spec.rb
describe 'deletion prevention' do
  it 'prevents deletion of category with transactions' do
    category = create(:category, user: user)
    create(:transaction, user: user, category: category)

    expect { category.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
    expect(category.reload).to be_persisted
  end

  it 'allows deletion of category without transactions' do
    category = create(:category, user: user)

    expect { category.destroy! }.not_to raise_error
    expect(Category.exists?(category.id)).to be false
  end
end
```

### Padrões Comuns de Correção em Statistics

#### 1. Conversão de Tipos
```ruby
# ❌ Errado - comparação falha
result[:total] = Transaction.sum(:amount)
expect(result[:total]).to eq(1000)  # Falha: BigDecimal != Integer

# ✅ Correto
result[:total] = Transaction.sum(:amount).to_f
expect(result[:total]).to eq(1000.0)
```

#### 2. Filtros de Período
```ruby
# ❌ Errado - não filtra período
total = category.transactions.sum(:amount)

# ✅ Correto
total = category.transactions
  .where('date >= ? AND date <= ?', start_date, end_date)
  .sum(:amount)
```

#### 3. Cálculo de Trend
```ruby
def calculate_trend(current, previous)
  return 'stable' if previous.zero?

  variation = ((current - previous) / previous * 100).round(2)

  if variation > 5  # threshold de 5%
    'up'
  elsif variation < -5
    'down'
  else
    'stable'
  end
end
```

### Template de Investigação

Para cada teste falhando, documentar:

```markdown
### Teste: [descrição]
**Linha:** spec/services/category_statistics_service_spec.rb:123

**Setup:**
- Categoria: Food
- Transações: 3 (100, 200, 300)
- Período: Este mês

**Expected:**
- total: 600.0
- average: 200.0
- count: 3

**Actual:**
- total: 1200.0  ← Incluindo transações de outros meses?
- average: 400.0
- count: 3

**Causa Provável:**
Query não filtra por período

**Correção:**
Adicionar `.where('date >= ? AND date <= ?', start_date, end_date)`
```

## Critérios de Sucesso
- [ ] Todos os testes de CategoryStatisticsService passam
- [ ] Cálculos de estatísticas corretos
- [ ] Trends calculados corretamente
- [ ] Formatação de valores adequada
- [ ] Prevenção de deleção implementada
- [ ] Testes de deleção passam
- [ ] Todos os testes de Category model passam
- [ ] Nenhum teste anterior quebrou

## Notas de Teste

### Comandos Úteis

```bash
# Testes do CategoryStatisticsService
bundle exec rspec spec/services/category_statistics_service_spec.rb

# Testes do Category model
bundle exec rspec spec/models/category_spec.rb

# Com documentação detalhada
bundle exec rspec spec/services/category_statistics_service_spec.rb --format documentation

# Teste específico de deleção
bundle exec rspec spec/models/category_spec.rb -e "deletion"
```

### Debugging

```ruby
# No teste ou service, adicionar:
puts "SQL: #{query.to_sql}"
puts "Result: #{result.inspect}"
puts "Type: #{result.class}"

# Ou usar pry:
binding.pry
```

## Referências
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md - Seções "Problema 7 e 8"
- [Rails Callbacks] https://guides.rubyonrails.org/active_record_callbacks.html
- [Dependent Options] https://guides.rubyonrails.org/association_basics.html#dependent
