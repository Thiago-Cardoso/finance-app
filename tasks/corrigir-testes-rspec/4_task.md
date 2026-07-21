---
status: pending
parallelizable: true
blocked_by: ["3.0"]
---

<task_context>
<domain>backend/services</domain>
<type>implementation</type>
<scope>dashboard_service</scope>
<complexity>low</complexity>
<dependencies>active_record|scopes</dependencies>
<unblocks>"9.0"</unblocks>
</task_context>

# Tarefa 4.0: Corrigir DashboardService - total_balance (Filtro de Contas Ativas)

## Visão Geral
Corrigir o método `total_balance` no DashboardService para somar apenas contas ativas, excluindo contas inativas do cálculo. Este é um quick win: simples de corrigir e resolve 1 teste.

## Contexto
O método `total_balance` atualmente soma o saldo de todas as contas do usuário, sem filtrar por status ativo/inativo. O teste espera que apenas contas com `is_active: true` sejam incluídas no cálculo.

## Requisitos
- [ ] Acesso ao DashboardService
- [ ] Entendimento do modelo Account
- [ ] Verificação de scope `.active` em Account
- [ ] Capacidade de rodar testes do service

## Subtarefas

### 4.1 Verificar Teste Falhando
- Executar spec/services/dashboard_service_spec.rb:87
- Anotar valores esperados vs atuais
- Verificar setup do teste (quantas contas, quais ativas)
- Documentar expectativa clara

### 4.2 Analisar Implementação Atual
- Ler código de DashboardService#total_balance
- Identificar query SQL atual
- Verificar se filtro is_active está presente
- Documentar problema exato

### 4.3 Verificar Scope no Account Model
- Verificar se `scope :active` existe em Account
- Se não existir, criar scope
- Testar scope isoladamente
- Documentar scope

### 4.4 Implementar Correção
- Adicionar filtro `.active` ou `.where(is_active: true)`
- Manter conversão `.to_f`
- Testar mudança

### 4.5 Validar Correção
- Executar teste específico (linha 87)
- Executar todos os testes de dashboard_service_spec.rb
- Verificar que nenhum teste quebrou
- Verificar outros métodos que podem precisar do mesmo filtro

### 4.6 Limpar e Documentar
- Remover código comentado se houver
- Adicionar comentário se necessário
- Criar commit descritivo

## Sequenciamento
- **Bloqueado por:** 3.0 (Autenticação - para garantir ambiente estável)
- **Desbloqueia:** 9.0 (Validação final)
- **Paralelizável:** Sim - pode rodar em paralelo com 5.0, 6.0, 7.0, 8.0

## Detalhes de Implementação

### Arquivos a Modificar

```
app/services/dashboard_service.rb
app/models/account.rb (verificar/adicionar scope)
```

### Teste Falhando

```ruby
# spec/services/dashboard_service_spec.rb:87
describe '#total_balance' do
  it 'sums only active accounts' do
    # Setup:
    # - account (let) com balance 1000, is_active: true
    # - nova conta com balance 500, is_active: true
    # - nova conta com balance 200, is_active: false

    create(:account, user: user, current_balance: 500, is_active: true)
    create(:account, user: user, current_balance: 200, is_active: false)

    result = service.send(:total_balance)

    # Expectativa: 1000 + 500 = 1500 (excluindo 200 da conta inativa)
    expect(result).to eq(1500.0)
  end
end
```

### Implementação Atual (Problema)

```ruby
# app/services/dashboard_service.rb
def total_balance
  user.accounts.sum(:current_balance).to_f  # ❌ Soma TODAS as contas
end
```

**Resultado Atual:** 1700.0 (1000 + 500 + 200)
**Resultado Esperado:** 1500.0 (1000 + 500, sem 200)

### Solução Proposta

**Opção 1: Usar scope (Recomendada)**
```ruby
# app/services/dashboard_service.rb
def total_balance
  user.accounts.active.sum(:current_balance).to_f  # ✅ Apenas contas ativas
end
```

**Opção 2: Usar where inline**
```ruby
# app/services/dashboard_service.rb
def total_balance
  user.accounts.where(is_active: true).sum(:current_balance).to_f
end
```

**Decisão:** Usar Opção 1 se scope existir, criar scope se não existir.

### Verificar/Criar Scope em Account

```ruby
# app/models/account.rb
class Account < ApplicationRecord
  belongs_to :user

  # Verificar se este scope existe
  scope :active, -> { where(is_active: true) }

  # Se não existir, adicionar
end
```

### Query SQL Gerada

**Antes:**
```sql
SELECT SUM("accounts"."current_balance")
FROM "accounts"
WHERE "accounts"."user_id" = 1
```

**Depois:**
```sql
SELECT SUM("accounts"."current_balance")
FROM "accounts"
WHERE "accounts"."user_id" = 1
  AND "accounts"."is_active" = TRUE
```

### Outros Métodos que Podem Precisar do Filtro

Verificar se outros métodos em DashboardService também devem filtrar por contas ativas:

```ruby
# Métodos a verificar:
# - monthly_evolution (se usa accounts)
# - recent_transactions (se filtra por account)
# - current_balance (alias para total_balance?)
```

**Nota:** Focar apenas em total_balance nesta tarefa, mas documentar outros para análise.

### Teste de Validação

```bash
# Rodar teste específico
bundle exec rspec spec/services/dashboard_service_spec.rb:87

# Rodar todos os testes do service
bundle exec rspec spec/services/dashboard_service_spec.rb

# Rodar com debug
bundle exec rspec spec/services/dashboard_service_spec.rb:87 --format documentation

# Verificar SQL gerado (adicionar temporariamente no teste):
# ActiveRecord::Base.logger = Logger.new(STDOUT)
```

## Critérios de Sucesso
- [ ] Teste spec/services/dashboard_service_spec.rb:87 passa
- [ ] Scope `.active` existe e funciona em Account
- [ ] Query SQL inclui filtro `is_active = TRUE`
- [ ] Nenhum outro teste do DashboardService quebrou
- [ ] Código limpo e sem comentários desnecessários
- [ ] Commit descritivo criado

## Notas de Teste

### Setup do Teste
```ruby
let(:user) { create(:user) }
let(:account) { create(:account, user: user, current_balance: 1000, is_active: true) }
let(:service) { described_class.new(user) }

# No teste:
create(:account, user: user, current_balance: 500, is_active: true)   # Deve contar
create(:account, user: user, current_balance: 200, is_active: false)  # NÃO deve contar
```

### Cálculo Esperado
- Conta 1 (let): 1000 (ativa) ✅
- Conta 2: 500 (ativa) ✅
- Conta 3: 200 (inativa) ❌
- **Total:** 1500.0

### Comandos Úteis

```bash
# Teste específico
bundle exec rspec spec/services/dashboard_service_spec.rb:87

# Com descrição
bundle exec rspec spec/services/dashboard_service_spec.rb:87 --format documentation

# Ver SQL
VERBOSE=true bundle exec rspec spec/services/dashboard_service_spec.rb:87

# Rails console test para verificar scope
rails console test
> account = Account.first
> Account.active
> Account.active.to_sql
```

### Checklist de Validação

- [ ] Scope `.active` existe em Account model
- [ ] Scope retorna apenas contas com is_active: true
- [ ] DashboardService#total_balance usa scope
- [ ] Teste linha 87 passa
- [ ] Todos os testes de dashboard_service_spec.rb passam
- [ ] Nenhum warning novo

## Referências
- [PRD] tasks/corrigir-testes-rspec/prd.md
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md - Seção "Problema 2"
- [Rails Scopes] https://guides.rubyonrails.org/active_record_querying.html#scopes
