---
status: pending
parallelizable: false
blocked_by: []
---

<task_context>
<domain>frontend/ui/pagination</domain>
<type>debugging|implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>react-query|tanstack-query</dependencies>
<unblocks>2.0</unblocks>
</task_context>

# Tarefa 1.0: Diagnosticar e Corrigir Problema de Paginação

## Visão Geral

O componente de paginação (`/frontend/src/components/ui/Pagination/Pagination.tsx`) foi melhorado visualmente mas apresenta problemas funcionais. Esta tarefa envolve diagnosticar e corrigir o problema de paginação tanto no componente UI quanto na integração com React Query.

## Contexto do Problema

1. **Componente de Paginação**: Visualmente melhorado com gradientes blue-purple e dark mode
2. **Integração com Categories**: Usando paginação tradicional (page/per_page)
3. **Integração com Transactions**: Usando infinite scroll (useInfiniteQuery)
4. **Problema Reportado**: Paginação não está funcionando corretamente

## Requisitos

<requirements>
- Identificar se o problema está no componente UI, no hook ou na integração
- Verificar se a API está retornando os metadados corretos de paginação
- Garantir que o componente Pagination funcione corretamente com ambos os padrões (tradicional e infinite)
- Manter o design visual atual do componente
- Garantir compatibilidade com dark mode
- Testar responsividade mobile
</requirements>

## Subtarefas

### 1.1 Diagnóstico

- [ ] 1.1.1 Verificar logs do navegador para erros de paginação
- [ ] 1.1.2 Testar API manualmente com curl/Postman para validar resposta
- [ ] 1.1.3 Inspecionar estado do React Query DevTools
- [ ] 1.1.4 Verificar se callbacks de onPageChange estão sendo chamados
- [ ] 1.1.5 Validar props passadas para o componente Pagination

### 1.2 Correção do Hook useCategories

- [ ] 1.2.1 Verificar se o hook está fazendo a requisição correta
- [ ] 1.2.2 Validar parseamento dos metadados de paginação
- [ ] 1.2.3 Garantir que queryKey seja atualizado corretamente
- [ ] 1.2.4 Implementar invalidação adequada de cache

### 1.3 Correção do Componente Pagination

- [ ] 1.3.1 Verificar lógica de cálculo de páginas em getPageNumbers()
- [ ] 1.3.2 Validar estados disabled dos botões
- [ ] 1.3.3 Garantir que onClick handlers estejam corretos
- [ ] 1.3.4 Verificar tipagem TypeScript

### 1.4 Testes Funcionais

- [ ] 1.4.1 Testar navegação entre páginas
- [ ] 1.4.2 Testar botões First/Last page
- [ ] 1.4.3 Testar com diferentes quantidades de páginas (1, 2, 5, 10+)
- [ ] 1.4.4 Testar comportamento quando não há dados

## Detalhes de Implementação

### Arquivo: `/frontend/src/components/ui/Pagination/Pagination.tsx`

**Problema Potencial #1**: O componente pode não estar recebendo as props corretas.

**Verificações necessárias**:
```typescript
interface PaginationProps {
  currentPage: number      // Deve ser >= 1
  totalPages: number       // Deve ser >= 1
  onPageChange: (page: number) => void  // Callback deve atualizar estado
}
```

**Problema Potencial #2**: A função `getPageNumbers()` pode ter bug na lógica de elipse.

**Código atual** (linhas 17-50):
```typescript
const getPageNumbers = () => {
  const pages: (number | string)[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    // Caso simples: todas as páginas visíveis
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    // Lógica complexa com elipses
    // VERIFICAR SE ESTÁ CORRETA
  }
  return pages
}
```

### Arquivo: `/frontend/src/hooks/useCategories.ts`

**Verificar integração**:
```typescript
export function useCategories(filters: CategoryFilters, page: number = 1) {
  return useQuery({
    queryKey: categoryKeys.list(filters, page),  // ← Verificar se page está no queryKey
    queryFn: () => categoriesService.getAll({ ...filters, page }),
    select: (data) => ({
      data: data.data,
      meta: data.meta  // ← Verificar estrutura
    })
  })
}
```

### Arquivo: `/frontend/src/app/categories/page.tsx`

**Verificar integração** (linhas 209-218):
```typescript
{pagination && pagination.total_pages > 1 && (
  <Pagination
    currentPage={pagination.current_page || 1}
    totalPages={pagination.total_pages || 1}
    onPageChange={(newPage) => {
      setPage(newPage)  // ← Verificar se estado é atualizado
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }}
  />
)}
```

### Estrutura Esperada da API

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_count": 45,
      "per_page": 10
    }
  }
}
```

## Casos de Teste

### Teste 1: Navegação Básica
1. Abrir página de categories
2. Verificar se paginação aparece (se total_pages > 1)
3. Clicar em "Next"
4. Verificar se página muda para 2
5. Verificar se dados são atualizados

### Teste 2: Navegação para Primeira/Última Página
1. Ir para página 3
2. Clicar no botão "First" (ChevronsLeft)
3. Verificar se volta para página 1
4. Clicar no botão "Last" (ChevronsRight)
5. Verificar se vai para última página

### Teste 3: Número de Página Direto
1. Clicar em um número de página específico
2. Verificar se navega corretamente
3. Verificar se botão fica com estilo ativo (gradiente azul-roxo)

### Teste 4: Estados Desabilitados
1. Na página 1, verificar se "Previous" e "First" estão desabilitados
2. Na última página, verificar se "Next" e "Last" estão desabilitados

### Teste 5: Mobile Responsivo
1. Reduzir viewport para mobile
2. Verificar se botões "Previous" e "Next" mantêm texto apenas em sm+
3. Verificar se botões First/Last são hidden em mobile

## Critérios de Sucesso

- [ ] Paginação funciona corretamente em todas as páginas
- [ ] Navegação entre páginas atualiza dados corretamente
- [ ] Estados disabled funcionam adequadamente
- [ ] Visual mantém gradiente blue-purple do design atual
- [ ] Dark mode funciona corretamente
- [ ] Responsividade mobile funciona (botões se adaptam)
- [ ] Scroll automático para topo funciona ao mudar de página
- [ ] Performance: Transição entre páginas < 300ms
- [ ] Sem erros no console
- [ ] Metadados de paginação são exibidos corretamente

## Ferramentas de Diagnóstico

### React Query DevTools
```bash
# Verificar no navegador
# Abrir React Query DevTools
# Procurar por query com key ['categories', 'list', ...]
# Verificar status, data e meta
```

### Teste Manual da API
```bash
# Testar endpoint de categories
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/categories?page=2&per_page=10"
```

### Browser DevTools
```javascript
// Console do navegador
// Adicionar log temporário em onPageChange
onPageChange={(newPage) => {
  console.log('Changing to page:', newPage)
  setPage(newPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}}
```

## Estimativa de Complexidade

- **Complexidade**: Média
- **Tempo Estimado**: 3-4 horas
- **Risco**: Baixo (componente isolado)
- **Dependências**: API backend (já implementada)

## Próximos Passos

Após completar esta tarefa, desbloqueia:
- **2.0**: Corrigir Layout da Tela de Transactions (depende de entendimento de paginação)
