---
status: pending
parallelizable: true
blocked_by: ["3.0"]
---

<task_context>
<domain>backend/services</domain>
<type>implementation</type>
<scope>dashboard_service_goals</scope>
<complexity>low</complexity>
<dependencies>goal_model</dependencies>
<unblocks>"9.0"</unblocks>
</task_context>

# Tarefa 6.0: Corrigir DashboardService - goals_progress (Atributos Atualizados)

## Visão Geral
Atualizar o método `goals_progress` para usar os atributos e métodos corretos do modelo Goal após as refatorações realizadas (title → name, is_achieved → status, etc).

## Contexto
O modelo Goal passou por várias mudanças de schema e nomenclatura. O método `goals_progress` precisa ser atualizado para refletir estas mudanças.

## Requisitos
- [ ] Conhecimento das mudanças no modelo Goal
- [ ] Referência ao RSPEC_FIXES_SUMMARY.md
- [ ] Acesso ao DashboardService

## Subtarefas

### 6.1 Revisar Mudanças no Goal Model
- Revisar RSPEC_FIXES_SUMMARY.md seção Goal
- Listar atributos antigos → novos
- Listar métodos antigos → novos
- Listar scopes antigos → novos

### 6.2 Analisar Implementação Atual de goals_progress
- Identificar todos os atributos usados
- Identificar todos os métodos chamados
- Identificar todos os scopes usados
- Marcar o que precisa ser atualizado

### 6.3 Atualizar Atributos
- `title` → `name`
- `is_achieved` → `status`
- Outros conforme necessário

### 6.4 Atualizar Métodos
- `percentage_achieved` → `progress_percentage`
- `suggested_monthly_contribution` → `monthly_target`
- Verificar se `days_remaining` existe

### 6.5 Atualizar Scopes/Queries
- `.where(is_achieved: false)` → `.active`
- Verificar outros filtros

### 6.6 Validar Correções
- Rodar testes de goals_progress
- Verificar formato de resposta
- Validar cálculos

## Detalhes de Implementação

### Mudanças Necessárias

**Antes:**
```ruby
def goals_progress
  user.goals.where(is_achieved: false)  # ❌
    .includes(:transactions)
    .limit(5)
    .map do |goal|
      {
        id: goal.id,
        title: goal.title,  # ❌ Usar name
        target_amount: format_currency(goal.target_amount),
        current_amount: format_currency(goal.current_amount),
        progress_percentage: goal.percentage_achieved,  # ❌ Método renomeado
        target_date: goal.target_date,
        days_remaining: goal.days_remaining,
        monthly_target: format_currency(goal.suggested_monthly_contribution),  # ❌
        status: goal.is_achieved ? 'completed' : 'active'  # ❌
      }
    end
end
```

**Depois:**
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
        status: goal.status  # ✅ Atributo correto (enum)
      }
    end
end
```

### Mapeamento de Mudanças

| Antigo | Novo | Tipo |
|--------|------|------|
| `title` | `name` | Atributo |
| `is_achieved` | `status` | Atributo (boolean → enum) |
| `percentage_achieved` | `progress_percentage` | Método |
| `suggested_monthly_contribution` | `monthly_target` | Método |
| `.where(is_achieved: false)` | `.active` | Scope |
| `.achieved` | `.completed` | Scope |
| `mark_as_achieved!` | `complete_goal!` | Método |

## Critérios de Sucesso
- [ ] Usa `goal.name` ao invés de `goal.title`
- [ ] Usa scope `.active` ao invés de `where(is_achieved: false)`
- [ ] Usa `goal.progress_percentage` ao invés de `goal.percentage_achieved`
- [ ] Usa `goal.monthly_target` ao invés de `goal.suggested_monthly_contribution`
- [ ] Usa `goal.status` diretamente (é um enum)
- [ ] Todos os testes relacionados a goals_progress passam
- [ ] Nenhum teste anterior quebrou

## Notas de Teste

```bash
# Testes do DashboardService relacionados a goals
bundle exec rspec spec/services/dashboard_service_spec.rb -e "goals"

# Todos os testes do service
bundle exec rspec spec/services/dashboard_service_spec.rb
```

## Referências
- [RSPEC_FIXES_SUMMARY.md] Seção 8 e 9
- [Tech Spec] tasks/corrigir-testes-rspec/techspec.md - Seção "Problema 4"
