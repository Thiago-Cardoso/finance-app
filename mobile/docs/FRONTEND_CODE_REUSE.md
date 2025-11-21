# Frontend Code Reuse - Mobile App (DRY Approach)

## ✅ Abordagem Atual: Symlinks

**Status:** Implementado com sucesso usando **symlinks** para compartilhar código entre frontend e mobile.

### Estrutura Compartilhada

```
finance-app/
├── frontend/
│   └── src/
│       ├── types/           ← Source of truth
│       │   ├── analytics.ts
│       │   ├── transaction.ts
│       │   ├── category.ts
│       │   ├── charts.ts
│       │   ├── goal.ts
│       │   └── auth.ts
│       └── utils/
│           └── formatters.ts ← Source of truth
│
└── mobile/
    └── src/
        └── shared/
            ├── types/ → ../../../frontend/src/types         (symlink)
            └── utils/
                ├── formatters.ts → ../../../../frontend/src/utils/formatters.ts (symlink)
                └── navigation.ts (mobile-specific)
```

### Vantagens desta Abordagem

✅ **DRY (Don't Repeat Yourself)** - Código não é duplicado
✅ **Single Source of Truth** - Frontend é a fonte da verdade
✅ **Sincronização Automática** - Mudanças no frontend refletem imediatamente no mobile
✅ **Manutenção Simplificada** - Atualizar em um lugar, funciona em ambos
✅ **Zero Overhead** - Não precisa de build tools ou packages extras
✅ **Git Friendly** - Symlinks são versionados normalmente

### Como Funciona

#### Types
```typescript
// mobile/src/shared/models/Dashboard.model.ts
export type {
  FinancialSummary,      // ← Importa diretamente de frontend/src/types/analytics.ts
  CategoryBreakdown,
  BudgetDetail,
  DashboardData,
} from '@/shared/types/analytics';
```

O import `@/shared/types/analytics` resolve para `frontend/src/types/analytics.ts` via symlink.

#### Formatters
```typescript
// mobile/src/app/dashboard/components/SummaryCard.tsx
import { formatCurrency, formatPercent } from '@/shared/utils/formatters';
```

Importa diretamente do `frontend/src/utils/formatters.ts`.

### Alterações Realizadas

#### 1. Symlinks Criados
```bash
# Types folder (pasta inteira)
ln -s ../../../frontend/src/types mobile/src/shared/types

# Formatters (arquivo individual)
ln -s ../../../../frontend/src/utils/formatters.ts mobile/src/shared/utils/formatters.ts
```

#### 2. Função Adicionada ao Frontend
Adicionei `formatShortDate()` no `frontend/src/utils/formatters.ts` para uso compartilhado:
```typescript
export function formatShortDate(date: string | Date): string {
  // Formato: "15 Jan"
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(dateObj);
}
```

### Types Compartilhados

Todos os types do frontend estão disponíveis no mobile:

#### `analytics.ts`
- ✅ FinancialSummary
- ✅ CategoryBreakdown
- ✅ BudgetDetail
- ✅ BudgetPerformance
- ✅ DashboardData
- ✅ TimeSeriesData
- ✅ TrendAnalysis

#### `transaction.ts`
- ✅ Transaction
- ✅ TransactionFormData
- ✅ TransactionFilters
- ✅ Category
- ✅ Account

#### `category.ts`
- ✅ CategoryType
- ✅ Category (completo)
- ✅ CategoryStatistics

#### `charts.ts`
- ✅ ChartData
- ✅ PieChartProps
- ✅ LineChartProps
- ✅ BarChartProps

#### `goal.ts`
- ✅ Goal
- ✅ GoalFormData

#### `auth.ts`
- ✅ User
- ✅ AuthResponse

### Formatters Compartilhados

Todas as funções do frontend estão disponíveis:
- ✅ `formatCurrency(value)`
- ✅ `formatDate(date)`
- ✅ `formatDateTime(date)`
- ✅ `formatPercent(value, decimals)`
- ✅ `formatCompactNumber(value)`
- ✅ `formatShortDate(date)` ← Adicionado para mobile

### Componentes Refatorados

#### Dashboard.model.ts
```typescript
// Re-exports types do frontend via symlink
export type {
  FinancialSummary,
  CategoryBreakdown,
  BudgetDetail,
  DashboardData,
} from '@/shared/types/analytics';
```

#### SummaryCard.tsx
```typescript
import { formatCurrency } from '@/shared/utils/formatters';
import type { FinancialSummary } from '@/shared/models/Dashboard.model';

// Usa campos do frontend:
summary.total_income     // ✅
summary.total_expenses   // ✅
summary.net_savings      // ✅
```

#### ExpenseChart.tsx
```typescript
import { formatPercent } from '@/shared/utils/formatters';
import type { CategoryBreakdown } from '@/shared/models/Dashboard.model';

// Usa campos do frontend:
expense.total_amount     // ✅
expense.category_name    // ✅
expense.percentage       // ✅
```

#### BudgetProgress.tsx
```typescript
import type { BudgetDetail } from '@/shared/models/Dashboard.model';

// Usa campos do frontend:
budget.budget_amount     // ✅
budget.spent_amount      // ✅
budget.percentage_used   // ✅
budget.status            // ✅ 'safe' | 'warning' | 'exceeded'
```

## Verificação do Backend

O backend deve retornar os campos conforme definido no frontend:

### Endpoint: GET /api/v1/dashboard

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "period": "this_month",
      "start_date": "2025-11-01",
      "end_date": "2025-11-30",
      "total_income": 5000.00,
      "total_expenses": 3000.00,
      "net_savings": 2000.00,
      "savings_rate": 40.0,
      "total_transactions": 25
    },
    "categories_breakdown": [{
      "category_id": 1,
      "category_name": "Alimentação",
      "category_type": "expense",
      "category_color": "#FF6B6B",
      "category_icon": "utensils",
      "total_amount": 1000.00,
      "percentage": 33.33,
      "transaction_count": 10
    }],
    "budget_performance": {
      "budgets": [{
        "budget_id": 1,
        "category_id": 1,
        "category_name": "Alimentação",
        "category_color": "#FF6B6B",
        "budget_amount": 1500.00,
        "spent_amount": 1000.00,
        "remaining_amount": 500.00,
        "percentage_used": 66.67,
        "status": "safe"
      }]
    },
    "recent_transactions": [...]
  }
}
```

### Testar Backend
```bash
# Com autenticação
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/dashboard?period=this_month | jq

# Verificar campos
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/dashboard | \
  jq '.data.summary | keys'
```

## Outras Abordagens Possíveis

### Opção 2: Monorepo (Futuro)

Para projetos maiores, considerar estrutura de monorepo:

```
finance-app/
├── packages/
│   ├── shared/              ← Package compartilhado
│   │   ├── types/
│   │   ├── utils/
│   │   └── package.json
│   ├── frontend/            ← App web
│   │   └── package.json
│   └── mobile/              ← App mobile
│       └── package.json
├── package.json             ← Root workspace
└── turbo.json               ← Turborepo config
```

**Ferramentas:**
- [Turborepo](https://turbo.build/) - Build system para monorepos
- [Nx](https://nx.dev/) - Monorepo com cache inteligente
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)

### Opção 3: NPM Package Privado

Criar package `@finance-app/shared`:
```bash
npm init @finance-app/shared
npm publish --registry=https://npm.seuservidor.com
```

Instalar em ambos projetos:
```bash
npm install @finance-app/shared
```

## Comandos Úteis

### Verificar Symlinks
```bash
# Listar symlinks
ls -la mobile/src/shared/types
ls -la mobile/src/shared/utils

# Verificar destino
readlink mobile/src/shared/types
readlink mobile/src/shared/utils/formatters.ts
```

### Recriar Symlinks (se necessário)
```bash
cd mobile/src/shared

# Types
rm -rf types
ln -s ../../../frontend/src/types types

# Formatters
rm utils/formatters.ts
ln -s ../../../../frontend/src/utils/formatters.ts utils/formatters.ts
```

### Limpar Cache do Metro
```bash
cd mobile
npm start -- --reset-cache
watchman watch-del-all
rm -rf node_modules/.cache
```

## Próximos Passos

### Curto Prazo ✅
- [x] Criar symlinks para types
- [x] Criar symlink para formatters
- [x] Adicionar formatShortDate ao frontend
- [x] Refatorar Dashboard para usar types compartilhados
- [ ] Testar com backend real
- [ ] Verificar TypeScript compilation

### Médio Prazo
- [ ] Compartilhar mais utils (validações, helpers)
- [ ] Avaliar compartilhamento de schemas (Zod)
- [ ] Criar guia de contribuição (quando adicionar type, adicionar no frontend)

### Longo Prazo
- [ ] Migrar para monorepo (Turborepo/Nx)
- [ ] Criar package compartilhado
- [ ] CI/CD para validar types em ambos projetos
- [ ] Compartilhar componentes React Native Web

## Troubleshooting

### Erro: Cannot find module '@/shared/types/analytics'

**Solução:**
```bash
# Limpar cache do Metro
npm start -- --reset-cache

# Verificar symlink
ls -la src/shared/types

# Recriar se necessário
ln -sf ../../../frontend/src/types src/shared/types
```

### Erro: Module resolution failed

Verificar `tsconfig.json` e `babel.config.js`:
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

```js
// babel.config.js
module.exports = {
  plugins: [
    ['module-resolver', {
      alias: { '@': './src' }
    }]
  ]
}
```

## Benefícios Alcançados

✅ **Zero Duplicação** - Código compartilhado via symlinks
✅ **Sincronização Automática** - Mudanças imediatas em ambos projetos
✅ **Type Safety** - TypeScript valida consistência
✅ **Manutenção Simplificada** - Um lugar para atualizar
✅ **Git Friendly** - Symlinks versionados
✅ **Performance** - Sem overhead de build

## Observações Importantes

⚠️ **Symlinks no Windows:** Requer permissões de administrador ou habilitar Developer Mode

⚠️ **Git:** Symlinks são versionados como texto (caminho relativo), funcionam em todos SOs

⚠️ **Deploy:** Verificar se plataforma de deploy suporta symlinks (Vercel ✅, Netlify ✅, EAS ✅)

⚠️ **Mobile-Specific Code:** Manter em pastas separadas (`mobile/src/shared/utils/navigation.ts`)

---

**Última Atualização:** 2025-11-18
**Status:** ✅ Implementado com Symlinks (DRY)
**Abordagem:** Single Source of Truth no Frontend
