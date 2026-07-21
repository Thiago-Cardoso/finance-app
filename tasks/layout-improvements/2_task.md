---
status: pending
parallelizable: false
blocked_by: ["1.0"]
---

<task_context>
<domain>frontend/ui/transactions</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>react-query|infinite-scroll</dependencies>
<unblocks>3.0, 4.0</unblocks>
</task_context>

# Tarefa 2.0: Corrigir Layout da Tela de Transactions

## Visão Geral

A tela de transactions (`/frontend/src/app/transactions/page.tsx`) apresenta problemas de layout que precisam ser corrigidos. Esta tarefa envolve melhorar a estrutura, organização e apresentação da lista de transações, incluindo a implementação adequada de paginação (tradicional ou infinite scroll).

## Contexto do Problema

1. **Layout não está adequado**: Estrutura visual precisa de melhorias
2. **Paginação**: Atualmente usa infinite scroll mas pode precisar de paginação tradicional
3. **Filtros**: Layout de filtros pode estar conflitando com lista
4. **Responsividade**: Mobile pode ter problemas de layout
5. **Performance**: Carregamento de muitos itens pode afetar performance

## Requisitos

<requirements>
- Melhorar estrutura visual da tela de transactions
- Decidir entre infinite scroll e paginação tradicional
- Otimizar layout de filtros
- Garantir responsividade mobile adequada
- Implementar loading states apropriados
- Manter consistência com design system (gradientes blue-purple)
- Garantir dark mode funcional
- Melhorar acessibilidade (ARIA labels, keyboard navigation)
</requirements>

## Subtarefas

### 2.1 Análise e Planejamento

- [ ] 2.1.1 Avaliar UX atual vs desejada
- [ ] 2.1.2 Decidir: Infinite Scroll vs Paginação Tradicional
- [ ] 2.1.3 Criar mockup/wireframe da nova estrutura
- [ ] 2.1.4 Documentar decisões de design

### 2.2 Reestruturação do Layout Principal

- [ ] 2.2.1 Reorganizar grid layout (filters vs list)
- [ ] 2.2.2 Melhorar header da página
- [ ] 2.2.3 Otimizar espaçamento e paddings
- [ ] 2.2.4 Implementar melhor hierarquia visual

### 2.3 Implementação de Paginação/Scroll

- [ ] 2.3.1 Se Paginação: Integrar componente Pagination (da tarefa 1.0)
- [ ] 2.3.2 Se Infinite Scroll: Melhorar UX do "Load More"
- [ ] 2.3.3 Implementar skeleton loading states
- [ ] 2.3.4 Adicionar virtualization se necessário (react-window)

### 2.4 Melhorias no TransactionList

- [ ] 2.4.1 Otimizar layout dos cards/items
- [ ] 2.4.2 Melhorar visual de estados vazios
- [ ] 2.4.3 Adicionar animações sutis
- [ ] 2.4.4 Implementar agrupamento por data (opcional)

### 2.5 Otimização de Filtros

- [ ] 2.5.1 Melhorar layout do TransactionFilters
- [ ] 2.5.2 Adicionar chips de filtros ativos
- [ ] 2.5.3 Implementar reset de filtros
- [ ] 2.5.4 Mobile: Transformar em drawer/modal

### 2.6 Responsividade Mobile

- [ ] 2.6.1 Testar layout em diferentes breakpoints
- [ ] 2.6.2 Ajustar grid para mobile (filtros colapsáveis)
- [ ] 2.6.3 Otimizar touch targets
- [ ] 2.6.4 Testar em dispositivos reais

### 2.7 Testes e Validação

- [ ] 2.7.1 Testar com diferentes quantidades de dados
- [ ] 2.7.2 Testar performance com muitos itens
- [ ] 2.7.3 Validar acessibilidade (screen reader)
- [ ] 2.7.4 Testar fluxo completo de CRUD

## Detalhes de Implementação

### Arquivo: `/frontend/src/app/transactions/page.tsx`

**Estrutura Atual** (linhas 75-139):
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    {/* Header */}
    <div className="mb-8">...</div>

    {/* Grid com Filtros e Lista */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filtros - 1 coluna */}
      <div className="lg:col-span-1">...</div>

      {/* Lista - 3 colunas */}
      <div className="lg:col-span-3">...</div>
    </div>
  </div>
</div>
```

**Problemas Identificados**:
1. Filtros ocupam muito espaço em desktop
2. Grid 1-4 pode não ser ideal para layout
3. Falta de separação visual clara
4. Mobile pode ter problemas com ordem dos elementos

**Proposta de Melhoria**:
```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    {/* Header com Título + Botões + Filtros Ativos */}
    <header className="mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col gap-4">
          {/* Linha 1: Título + New Transaction */}
          <div className="flex justify-between items-center">
            <div>
              <h1>Transactions</h1>
              <p>Manage your income, expenses and transfers</p>
            </div>
            <Button>New Transaction</Button>
          </div>

          {/* Linha 2: Filtros em linha + Toggle para filtros avançados */}
          <div className="flex gap-2 items-center flex-wrap">
            <Select placeholder="Type">...</Select>
            <Select placeholder="Category">...</Select>
            <DateRangePicker>...</DateRangePicker>
            <Button variant="ghost" onClick={toggleAdvancedFilters}>
              Advanced Filters
            </Button>
            {hasActiveFilters && <Button variant="ghost">Clear All</Button>}
          </div>

          {/* Linha 3: Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex gap-2 flex-wrap">
              <Chip onRemove={...}>Type: Expense</Chip>
              <Chip onRemove={...}>Category: Food</Chip>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Advanced Filters Drawer (Mobile) ou Sidebar (Desktop) */}
    {showAdvancedFilters && (
      <aside>...</aside>
    )}

    {/* Main Content: Transaction List */}
    <main>
      <TransactionList ... />

      {/* Paginação ou Load More */}
      {useTraditionalPagination ? (
        <Pagination ... />
      ) : (
        <Button onClick={loadMore}>Load More</Button>
      )}
    </main>
  </div>
</div>
```

### Arquivo: `/frontend/src/components/transactions/TransactionList.tsx`

**Melhorias Necessárias**:

1. **Agrupamento por Data** (opcional):
```tsx
// Agrupar transações por data
const groupedTransactions = groupBy(transactions, (t) =>
  format(new Date(t.date), 'yyyy-MM-dd')
)

return (
  <div>
    {Object.entries(groupedTransactions).map(([date, txs]) => (
      <div key={date}>
        <h3 className="date-header">{formatDate(date)}</h3>
        <div className="transactions-of-day">
          {txs.map(tx => <TransactionItem ... />)}
        </div>
      </div>
    ))}
  </div>
)
```

2. **Skeleton Loading**:
```tsx
{isLoading && (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <TransactionItemSkeleton key={i} />
    ))}
  </div>
)}
```

3. **Virtualization** (se muitos itens):
```tsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={transactions.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  )}
</FixedSizeList>
```

### Arquivo: `/frontend/src/components/transactions/TransactionFilters.tsx`

**Implementação de Filtros Inline + Advanced**:

```tsx
interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
  mode: 'inline' | 'advanced'
}

export function TransactionFilters({ filters, onFiltersChange, mode }: TransactionFiltersProps) {
  if (mode === 'inline') {
    return (
      <div className="flex gap-2">
        <Select
          value={filters.transaction_type}
          onChange={(val) => onFiltersChange({ ...filters, transaction_type: val })}
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>

        <CategorySelect
          value={filters.category_id}
          onChange={(val) => onFiltersChange({ ...filters, category_id: val })}
        />

        <DateRangePicker
          startDate={filters.date_from}
          endDate={filters.date_to}
          onChange={(range) => onFiltersChange({ ...filters, ...range })}
        />
      </div>
    )
  }

  // Advanced mode: Sidebar ou Drawer com todos os filtros
  return (
    <div className="space-y-4">
      {/* Todos os filtros disponíveis */}
    </div>
  )
}
```

### Decisão: Infinite Scroll vs Paginação Tradicional

**Infinite Scroll (Atual)**:
- **Prós**: UX moderna, menos cliques, bom para mobile
- **Contras**: Difícil voltar a item específico, performance issues com muitos itens

**Paginação Tradicional** (Recomendado):
- **Prós**: Melhor para desktop, mais fácil navegar, melhor performance
- **Contras**: Mais cliques, menos "fluido"

**Solução Híbrida** (Melhor opção):
- Desktop: Paginação tradicional
- Mobile: Infinite scroll ou Load More button

```tsx
const isMobile = useMediaQuery('(max-width: 768px)')

{isMobile ? (
  <InfiniteScroll ... />
) : (
  <Pagination ... />
)}
```

## Componentes Novos a Criar

### 1. TransactionItemSkeleton
```tsx
export function TransactionItemSkeleton() {
  return (
    <div className="animate-pulse p-4 border-b">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}
```

### 2. FilterChip
```tsx
interface FilterChipProps {
  label: string
  value: string
  onRemove: () => void
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm">
      <span>{label}: {value}</span>
      <button onClick={onRemove}>×</button>
    </div>
  )
}
```

### 3. EmptyState
```tsx
export function TransactionsEmptyState({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <p>No transactions found with current filters</p>
        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-400" />
      <h3>No transactions yet</h3>
      <p>Create your first transaction to get started</p>
      <Button onClick={openCreateModal}>Create Transaction</Button>
    </div>
  )
}
```

## Critérios de Sucesso

- [ ] Layout é visualmente agradável e organizado
- [ ] Paginação funciona corretamente (se implementada)
- [ ] Infinite scroll funciona sem bugs (se mantido)
- [ ] Filtros são fáceis de usar e visualizar
- [ ] Loading states são claros
- [ ] Estados vazios são informativos
- [ ] Responsividade mobile é perfeita
- [ ] Dark mode funciona em todos os elementos
- [ ] Performance: Lista com 100+ itens renderiza em < 1s
- [ ] Acessibilidade: WCAG AA compliance
- [ ] Sem erros no console
- [ ] UX flow de criar/editar/deletar é fluido

## Casos de Teste

### Teste 1: Layout Responsivo
1. Desktop (1920px): Verificar layout de 2 colunas
2. Tablet (768px): Verificar adaptação
3. Mobile (375px): Verificar stack vertical

### Teste 2: Filtros
1. Aplicar filtro de tipo "Expense"
2. Verificar se lista atualiza
3. Aplicar filtro de categoria
4. Verificar chips de filtros ativos
5. Limpar todos os filtros

### Teste 3: Paginação/Scroll
1. Navegar entre páginas (ou scroll)
2. Verificar se dados são carregados corretamente
3. Verificar loading states

### Teste 4: CRUD Operations
1. Criar nova transaction
2. Verificar se aparece na lista
3. Editar transaction
4. Deletar transaction

### Teste 5: Performance
1. Carregar lista com 100+ transações
2. Medir tempo de renderização
3. Verificar scroll performance

## Estimativa de Complexidade

- **Complexidade**: Alta
- **Tempo Estimado**: 8-12 horas
- **Risco**: Médio (muitas mudanças)
- **Dependências**: Tarefa 1.0 (paginação)

## Próximos Passos

Após completar esta tarefa, desbloqueia:
- **3.0**: Melhorar Layout da Tela de Categories
- **4.0**: Otimizar Responsividade Mobile em Todas as Telas
