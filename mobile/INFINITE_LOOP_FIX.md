# Correção do Loop Infinito na TransactionList

## Problema Identificado

O erro "Maximum update depth exceeded" estava ocorrendo devido a um loop infinito causado por uma cadeia de dependências entre hooks e callbacks.

### Cadeia do Loop Infinito (Antes da Correção)

1. **TransactionListView** cria `handleFiltersChange` com `useCallback([debouncedLoadTransactions])`
2. **debouncedLoadTransactions** é criado com `useDebouncedCallback(callback, 300)`
3. **useDebouncedCallback** atualiza internamente `callbackRef.current` em um `useEffect` quando `callback` muda
4. **useFilters** chama `onFiltersChange(newFilters)` que dispara `handleFiltersChange`
5. **handleFiltersChange** chama `debouncedLoadTransactions(newFilters)`
6. **loadTransactions** atualiza o Zustand store
7. **Store update** causa re-render do componente
8. **Re-render** recria `loadTransactions` (depende de `fetchTransactions` do Zustand)
9. **Novo loadTransactions** atualiza `loadTransactionsRef.current` via `useEffect`
10. **Isso recria `debouncedLoadTransactions`** porque o callback mudou
11. **Novo debouncedLoadTransactions recria `handleFiltersChange`** (dependência)
12. **Ciclo se repete infinitamente** ♻️

### Causa Raiz

O problema estava em **`handleFiltersChange` ter `debouncedLoadTransactions` como dependência**, o que fazia com que qualquer mudança em `loadTransactions` propagasse por toda a cadeia de callbacks, causando o loop.

## Solução Implementada

### Mudança Principal

Adicionamos um **ref intermediário** para `debouncedLoadTransactions` e **removemos todas as dependências** de `handleFiltersChange`:

```typescript
// Store debounced function in ref to break the dependency chain
const debouncedLoadRef = useRef(debouncedLoadTransactions);

useEffect(() => {
  debouncedLoadRef.current = debouncedLoadTransactions;
}, [debouncedLoadTransactions]);

// 100% Stable callback for filter changes - no dependencies!
const handleFiltersChange = useCallback((newFilters: TransactionFilters) => {
  // Skip loading on initial mount
  if (isInitialMount.current) {
    return;
  }
  debouncedLoadRef.current(newFilters);
}, []); // Empty dependencies array - completely stable!
```

### Como Funciona a Correção

1. **handleFiltersChange é 100% estável** (sem dependências)
2. **Usa ref** para acessar a versão mais recente de `debouncedLoadTransactions`
3. **Refs não causam re-render** nem afetam dependências de useCallback
4. **Quebra o ciclo** de dependências que causava o loop

### Arquitetura da Solução

```
TransactionListView
  ├── loadTransactions (do ViewModel)
  │   └── loadTransactionsRef (ref) ✅
  │
  ├── debouncedLoadTransactions (useDebouncedCallback)
  │   └── debouncedLoadRef (ref) ✅ NOVO!
  │
  ├── handleFiltersChange (useCallback)
  │   └── [] (sem dependências) ✅ ESTÁVEL!
  │
  └── useFilters({ onFiltersChange: handleFiltersChange })
      └── onFiltersChangeRef (ref) ✅
```

## Arquivos Modificados

### 1. `/mobile/src/app/transactions/TransactionList.view.tsx`

**Linhas 78-91** - Adicionado ref intermediário para quebrar o ciclo:

```typescript
// Store debounced function in ref to break the dependency chain
const debouncedLoadRef = useRef(debouncedLoadTransactions);

useEffect(() => {
  debouncedLoadRef.current = debouncedLoadTransactions;
}, [debouncedLoadTransactions]);

// 100% Stable callback for filter changes - no dependencies!
const handleFiltersChange = useCallback((newFilters: TransactionFilters) => {
  // Skip loading on initial mount
  if (isInitialMount.current) {
    return;
  }
  debouncedLoadRef.current(newFilters);
}, []); // Empty dependencies array - completely stable!
```

## Como Testar

### 1. Teste Manual Básico

```bash
# Iniciar o app
npm start

# No app:
# 1. Navegar para a aba de Transações
# 2. Verificar que a lista carrega sem erros
# 3. Verificar que não há loop infinito no console
```

### 2. Teste de Filtros

```bash
# No app (após navegar para Transações):
# 1. Clicar nas abas (Todas/Despesas/Receitas)
# 2. Digitar no campo de busca
# 3. Abrir filtros avançados e aplicar
# 4. Limpar filtros
# 5. Fazer pull-to-refresh
# 6. Scroll para carregar mais (paginação)
```

### 3. Teste de Stress

```bash
# No app:
# 1. Trocar rapidamente entre abas (Todas/Despesas/Receitas)
# 2. Digitar rapidamente no campo de busca
# 3. Aplicar e remover filtros rapidamente
# 4. Verificar que não há loops ou travamentos
```

### 4. Verificar Logs

```bash
# No Metro Bundler, verificar que não há:
# - "Maximum update depth exceeded"
# - Logs infinitos de re-render
# - Warnings de dependências circulares
```

## Comportamento Esperado

### ✅ Correto

- Lista carrega normalmente ao abrir a aba
- Filtros aplicam sem delays ou travamentos
- Busca funciona com debounce de 300ms
- Pull-to-refresh funciona
- Paginação funciona
- Sem loops infinitos ou erros no console

### ❌ Incorreto (Se ainda houver problemas)

- Erro "Maximum update depth exceeded"
- Lista não carrega
- Filtros não aplicam
- App trava ou fica lento
- Logs infinitos no console

## Conceitos-Chave Utilizados

### 1. useRef para Quebrar Dependências

Refs armazenam valores mutáveis que persistem entre renders mas **não causam re-render** quando atualizados.

```typescript
const myRef = useRef(someValue);

useEffect(() => {
  myRef.current = someValue; // Atualiza mas não causa re-render
}, [someValue]);

const stableCallback = useCallback(() => {
  myRef.current(); // Sempre acessa o valor mais recente
}, []); // Sem dependências!
```

### 2. useCallback com Array Vazio

Quando um callback não tem dependências, ele é criado apenas uma vez e nunca é recriado:

```typescript
const stableCallback = useCallback(() => {
  // Use refs para acessar valores atualizados
  ref.current();
}, []); // Completamente estável!
```

### 3. Debounce com Refs

Debounce functions precisam de estabilidade para não causarem loops:

```typescript
// Criar debounced function
const debouncedFn = useDebouncedCallback(callback, 300);

// Estabilizar com ref
const debouncedRef = useRef(debouncedFn);

useEffect(() => {
  debouncedRef.current = debouncedFn;
}, [debouncedFn]);

// Usar ref em callbacks estáveis
const stableCallback = useCallback(() => {
  debouncedRef.current(args);
}, []);
```

## Arquitetura MVVM e State Management

### Fluxo de Dados Correto

```
View (TransactionList.view.tsx)
  └── Callbacks estáveis com refs
      ↓
ViewModel (useTransaction.viewModel.ts)
  └── Selectors Zustand estáveis
      ↓
Store (transactionsStore.ts)
  └── State imutável
      ↓
API (transactions.service.ts)
  └── Dados do backend
```

### Princípios Aplicados

1. **Separação de Concerns**: View, ViewModel e Store bem separados
2. **Stable Selectors**: Hooks do Zustand para evitar re-renders
3. **Refs para Estabilidade**: Quebrar ciclos de dependências
4. **Callbacks Memoizados**: useCallback com deps corretas (ou vazias com refs)

## Referências

- [React useRef Documentation](https://react.dev/reference/react/useRef)
- [React useCallback Documentation](https://react.dev/reference/react/useCallback)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice-with-no-store-actions)
- [React Re-render Guide](https://react.dev/learn/render-and-commit)

## Histórico

- **2025-11-24**: Loop infinito corrigido adicionando ref intermediário para `debouncedLoadTransactions`
- **Tentativas Anteriores**:
  - Remover `loadTransactions` das deps do useEffect ❌
  - Usar `useCallback` para `handleFiltersChange` ❌
  - Usar `useRef` para `loadTransactions` ❌
  - Remover `initialFilters` do `useFilters` ❌
  - **Solução Final**: Usar ref para `debouncedLoadTransactions` E remover todas as deps de `handleFiltersChange` ✅

## Conclusão

O loop infinito foi causado por uma cadeia de dependências circulares entre callbacks, hooks e o Zustand store. A solução foi quebrar essa cadeia usando **refs intermediários** e garantir que o callback principal (`handleFiltersChange`) seja **100% estável** sem dependências.

Esta abordagem é escalável e pode ser aplicada a outros componentes que enfrentam problemas similares de loops infinitos causados por dependências circulares.
