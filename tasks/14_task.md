---
status: completed
parallelizable: false
blocked_by: ["3.0", "13.0"]
completed_date: 2025-10-03
---

<task_context>
<domain>frontend/interface</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>frontend_setup|api_dashboard</dependencies>
<unblocks>"15.0", "16.0"</unblocks>
</task_context>

# Tarefa 14.0: Interface do Dashboard

## Visão Geral
Implementar interface completa do dashboard principal com resumo financeiro, gráficos interativos, transações recentes e widgets de insights, integrando com a API do dashboard desenvolvida na Tarefa 13.0.

## Requisitos
- Dashboard responsivo com layout em grid
- Cards de resumo financeiro (receitas, despesas, saldo)
- Gráficos interativos de evolução financeira
- Lista de transações recentes
- Widgets de categorias mais utilizadas
- Indicadores de metas e orçamentos
- Navegação rápida para outras seções
- Estados de loading e error handling

## Subtarefas
- [x] 14.1 Implementar layout principal do dashboard ✅
- [x] 14.2 Criar cards de resumo financeiro ✅
- [x] 14.3 Desenvolver gráfico de evolução mensal ✅
- [x] 14.4 Implementar widget de transações recentes ✅
- [x] 14.5 Criar widget de top categorias ✅
- [x] 14.6 Desenvolver indicadores de metas ✅
- [x] 14.7 Implementar navegação rápida ✅
- [x] 14.8 Adicionar filtros de período ✅
- [x] 14.9 Configurar auto-refresh de dados ✅
- [x] 14.10 Implementar versão mobile otimizada ✅

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup), 13.0 (API Dashboard)
- Desbloqueia: 15.0 (Componentes Charts), 16.0 (Relatórios Básicos)
- Paralelizável: Não (depende de API e frontend base)

## Detalhes de Implementação

### 1. Página Principal do Dashboard
```tsx
// src/app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { FinancialChart } from '@/components/dashboard/FinancialChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TopCategories } from '@/components/dashboard/TopCategories'
import { GoalsProgress } from '@/components/dashboard/GoalsProgress'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [period, setPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  })

  const { data, isLoading, error, refetch } = useDashboard(period)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Erro ao carregar dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Period Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das suas finanças</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <PeriodFilter period={period} onPeriodChange={setPeriod} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCards data={data?.summary} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Financial Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <FinancialChart data={data?.monthly_evolution} />
        </div>

        {/* Top Categories */}
        <div className="lg:col-span-1">
          <TopCategories data={data?.top_categories} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentTransactions data={data?.recent_transactions} />
        </div>

        {/* Goals Progress */}
        <div className="lg:col-span-1">
          <GoalsProgress data={data?.goals} />
        </div>
      </div>
    </div>
  )
}
```

### 2. Cards de Resumo Financeiro
```tsx
// src/components/dashboard/SummaryCards.tsx
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { clsx } from 'clsx'

interface SummaryData {
  current_month: {
    income: string
    expenses: string
    balance: string
  }
  current_balance: string
  last_month_comparison: {
    income_change: number
    expenses_change: number
    balance_change: number
  }
}

interface SummaryCardsProps {
  data?: SummaryData
}

export function SummaryCards({ data }: SummaryCardsProps) {
  if (!data) {
    return <div className="animate-pulse">Loading summary...</div>
  }

  const income = parseFloat(data.current_month.income)
  const expenses = parseFloat(data.current_month.expenses)
  const balance = parseFloat(data.current_month.balance)
  const totalBalance = parseFloat(data.current_balance)

  const cards = [
    {
      title: 'Receitas do Mês',
      value: income,
      change: data.last_month_comparison?.income_change || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Despesas do Mês',
      value: expenses,
      change: data.last_month_comparison?.expenses_change || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Saldo do Mês',
      value: balance,
      change: data.last_month_comparison?.balance_change || 0,
      icon: Wallet,
      color: balance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: balance >= 0 ? 'bg-green-50' : 'bg-red-50',
      borderColor: balance >= 0 ? 'border-green-200' : 'border-red-200'
    },
    {
      title: 'Saldo Total',
      value: totalBalance,
      change: 0,
      icon: Target,
      color: totalBalance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositiveChange = card.change > 0
        const isNegativeChange = card.change < 0

        return (
          <div
            key={index}
            className={clsx(
              'bg-white rounded-lg border-2 p-6 shadow-sm hover:shadow-md transition-shadow',
              card.borderColor
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={clsx('text-2xl font-bold', card.color)}>
                  {formatCurrency(Math.abs(card.value))}
                </p>

                {card.change !== 0 && (
                  <div className="flex items-center mt-2">
                    {isPositiveChange ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        isPositiveChange ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {Math.abs(card.change).toFixed(1)}%
                    </span>
                    <span className="text-gray-500 text-sm ml-1">
                      vs mês anterior
                    </span>
                  </div>
                )}
              </div>

              <div className={clsx('p-3 rounded-lg', card.bgColor)}>
                <Icon className={clsx('w-6 h-6', card.color)} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### 3. Gráfico de Evolução Financeira
```tsx
// src/components/dashboard/FinancialChart.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MonthlyData {
  month: string
  income: string
  expenses: string
  balance: string
}

interface FinancialChartProps {
  data?: MonthlyData[]
}

export function FinancialChart({ data }: FinancialChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evolução Financeira
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          Dados não disponíveis
        </div>
      </div>
    )
  }

  const chartData = data.map(item => ({
    month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(item.month)),
    receitas: parseFloat(item.income),
    despesas: parseFloat(item.expenses),
    saldo: parseFloat(item.balance)
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Evolução Financeira
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span>Receitas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span>Despesas</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Saldo</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-gray-600"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-gray-600"
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="receitas"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#10b981' }}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#ef4444' }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#3b82f6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### 4. Widget de Transações Recentes
```tsx
// src/components/dashboard/RecentTransactions.tsx
import { Transaction } from '@/types/transaction'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'

interface RecentTransactionsProps {
  data?: Transaction[]
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  const router = useRouter()

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Transações Recentes
        </h3>
        <div className="text-center py-8 text-gray-500">
          Nenhuma transação encontrada
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Transações Recentes
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/transactions')}
          className="text-primary-600 hover:text-primary-700"
        >
          Ver todas
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {data.slice(0, 5).map((transaction) => {
          const isIncome = transaction.transaction_type === 'income'
          const isExpense = transaction.transaction_type === 'expense'
          const amount = parseFloat(transaction.amount)

          return (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: transaction.category?.color || '#6b7280' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatDate(transaction.date)}</span>
                    {transaction.category && (
                      <>
                        <span>•</span>
                        <span>{transaction.category.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={clsx(
                    'text-sm font-semibold',
                    isIncome && 'text-green-600',
                    isExpense && 'text-red-600',
                    transaction.transaction_type === 'transfer' && 'text-blue-600'
                  )}
                >
                  {isIncome && '+'}
                  {isExpense && '-'}
                  {formatCurrency(Math.abs(amount))}
                </div>
                <div className="text-xs text-gray-500">
                  {transaction.account?.name}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### 5. Widget de Top Categorias
```tsx
// src/components/dashboard/TopCategories.tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  category: string
  amount: string
  percentage: number
  color?: string
}

interface TopCategoriesProps {
  data?: CategoryData[]
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

export function TopCategories({ data }: TopCategoriesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Categorias
        </h3>
        <div className="text-center py-8 text-gray-500">
          Dados não disponíveis
        </div>
      </div>
    )
  }

  const chartData = data.map((item, index) => ({
    name: item.category,
    value: parseFloat(item.amount),
    percentage: item.percentage,
    color: COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Top Categorias (Gastos)
      </h3>

      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.slice(0, 5).map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700 truncate">
                {category.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(parseFloat(category.amount))}
              </div>
              <div className="text-xs text-gray-500">
                {category.percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 6. Ações Rápidas
```tsx
// src/components/dashboard/QuickActions.tsx
import { Button } from '@/components/ui/Button'
import { Plus, TrendingUp, TrendingDown, ArrowRightLeft, PieChart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: 'Nova Receita',
      icon: TrendingUp,
      color: 'bg-green-600 hover:bg-green-700',
      onClick: () => router.push('/transactions?type=income')
    },
    {
      label: 'Nova Despesa',
      icon: TrendingDown,
      color: 'bg-red-600 hover:bg-red-700',
      onClick: () => router.push('/transactions?type=expense')
    },
    {
      label: 'Transferência',
      icon: ArrowRightLeft,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => router.push('/transactions?type=transfer')
    },
    {
      label: 'Ver Relatórios',
      icon: PieChart,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => router.push('/reports')
    }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button
              key={index}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 h-auto flex-col space-y-2`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
```

## Critérios de Sucesso
- [x] Layout responsivo do dashboard funcionando ✅
- [x] Cards de resumo financeiro implementados ✅
- [x] Gráfico de evolução mensal operacional ✅
- [x] Widget de transações recentes funcionando ✅
- [x] Widget de top categorias implementado ✅
- [x] Indicadores de metas e progresso funcionando ✅
- [x] Navegação rápida para outras seções operacional ✅
- [x] Filtros de período implementados ✅
- [x] Auto-refresh de dados configurado ✅
- [x] Versão mobile otimizada funcionando ✅

## Checklist de Conclusão
- [x] 14.1 Implementação completada
- [x] 14.2 Definição da tarefa, PRD e tech spec validados
- [x] 14.3 Análise de regras e conformidade verificadas
- [x] 14.4 Revisão de código completada (ver `14_task_review.md`)
- [x] 14.5 Pronto para deploy

## Relatório de Revisão
Ver arquivo detalhado: `tasks/14_task_review.md`

**Status Final**: ✅ APROVADO COM RESSALVAS MENORES
**Data de Conclusão**: 2025-10-03

## Recursos Necessários
- Desenvolvedor frontend React/Next.js experiente
- Designer para refinamentos de UI/UX
- API do dashboard funcionando (Tarefa 13.0)
- Biblioteca de gráficos (Recharts) configurada

## Tempo Estimado
- Layout e estrutura principal: 6-8 horas
- Cards de resumo e widgets: 8-10 horas
- Gráficos e visualizações: 6-8 horas
- Navegação e ações rápidas: 4-5 horas
- Responsividade e mobile: 4-6 horas
- Testes e refinamentos: 4-6 horas
- **Total**: 5-6 dias de trabalho