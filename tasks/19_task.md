---
status: pending
parallelizable: false
blocked_by: ["3.0", "15.0", "18.0"]
---

<task_context>
<domain>frontend/features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>frontend_setup, charts, analytics</dependencies>
<unblocks>"23.0", "26.0"</unblocks>
</task_context>

# Tarefa 19.0: Interface de Relatórios Financeiros

## Visão Geral
Desenvolver interface completa para visualização e geração de relatórios financeiros no frontend, incluindo dashboard analítico, filtros avançados, gráficos interativos e exportação de dados.

## Requisitos
- Dashboard de relatórios com múltiplas visualizações
- Filtros avançados por período, categoria e tipo
- Gráficos interativos para análise de dados
- Relatórios pré-definidos e personalizáveis
- Sistema de exportação (PDF, Excel, CSV)
- Comparações temporais (MoM, YoY)
- Interface responsiva e intuitiva
- Cache de dados para performance
- Sharing de relatórios via URL
- Agendamento de relatórios (futuro)

## Subtarefas
- [ ] 19.1 Layout e estrutura da página de relatórios
- [ ] 19.2 Sistema de filtros avançados
- [ ] 19.3 Dashboard de resumo financeiro
- [ ] 19.4 Relatório de performance de orçamentos
- [ ] 19.5 Análise de tendências e padrões
- [ ] 19.6 Comparações temporais interativas
- [ ] 19.7 Sistema de exportação de dados
- [ ] 19.8 Relatórios personalizáveis
- [ ] 19.9 Sharing e permalinks
- [ ] 19.10 Otimização e performance

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup), 15.0 (Charts), 18.0 (Analytics Backend)
- Desbloqueia: 23.0 (Dashboard Avançado), 26.0 (Performance)
- Paralelizável: Não (depende de charts e analytics)

## Detalhes de Implementação

### 1. Hooks para Analytics
```tsx
// src/hooks/useAnalytics.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { AnalyticsFilters, FinancialSummary, BudgetPerformance } from '@/types/analytics'

export function useFinancialSummary(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'financial-summary', filters],
    queryFn: () => apiClient.get<FinancialSummary>('/analytics/financial_summary', {
      params: filters
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useBudgetPerformance(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: ['analytics', 'budget-performance', filters],
    queryFn: () => apiClient.get<BudgetPerformance>('/analytics/budget_performance', {
      params: filters
    }),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

export function useTrends(period: string = 'monthly', monthsBack: number = 12) {
  return useQuery({
    queryKey: ['analytics', 'trends', period, monthsBack],
    queryFn: () => apiClient.get('/analytics/trends', {
      params: { period, months_back: monthsBack }
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useExportReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ reportType, format, filters, name }: {
      reportType: string
      format: string
      filters: AnalyticsFilters
      name?: string
    }) => {
      const response = await apiClient.post('/analytics/export', {
        report_type: reportType,
        format,
        name,
        ...filters
      }, {
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${name || reportType}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return response
    },
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    }
  })
}
```

### 2. Types para Analytics
```ts
// src/types/analytics.ts
export interface AnalyticsFilters {
  start_date?: string
  end_date?: string
  category_id?: number
  category_ids?: number[]
  transaction_type?: 'income' | 'expense'
  min_amount?: number
  max_amount?: number
}

export interface FinancialSummary {
  summary: {
    period: {
      start_date: string
      end_date: string
      days_count: number
    }
    current_period: {
      total_income: number
      total_expense: number
      net_amount: number
      transaction_count: number
      avg_income: number
      avg_expense: number
    }
    previous_period: {
      total_income: number
      total_expense: number
      net_amount: number
      transaction_count: number
    }
    growth_rates: {
      income_growth: number
      expense_growth: number
      net_growth: number
    }
  }
  monthly_breakdown: Array<{
    month: string
    month_name: string
    income: number
    expense: number
    net: number
  }>
  category_breakdown: Array<{
    category_name: string
    color: string
    amount: number
    percentage: number
    transaction_count: number
  }>
  top_transactions: {
    expenses: Transaction[]
    incomes: Transaction[]
  }
  insights: Array<{
    type: 'success' | 'warning' | 'info' | 'error'
    title: string
    message: string
    action?: string
  }>
  generated_at: string
}

export interface BudgetPerformance {
  period: {
    start_date: string
    end_date: string
  }
  overall_performance: {
    total_budgets: number
    total_allocated: number
    total_spent: number
    overall_usage: number
    average_performance_score: number
    budgets_on_track: number
    budgets_over_budget: number
    success_rate: number
  }
  budget_details: Array<{
    budget_id: number
    budget_name: string
    category: string
    category_color?: string
    allocated_amount: number
    spent_amount: number
    remaining_amount: number
    usage_percentage: number
    days_total: number
    days_passed: number
    days_remaining: number
    daily_average: number
    projected_total: number
    projected_usage: number
    performance_score: number
    status: 'on_track' | 'over_budget' | 'critical' | 'ahead_of_schedule' | 'behind_schedule'
  }>
  recommendations: Array<{
    type: 'urgent' | 'warning' | 'success' | 'info'
    title: string
    message: string
    actions: string[]
  }>
  trends: Array<{
    month: string
    month_name: string
    budgets: Array<{
      budget_name: string
      usage_percentage: number
    }>
    average_usage: number
  }>
  generated_at: string
}

export interface TrendsData {
  income_trends: Array<{
    period: string
    amount: number
    growth_rate: number
  }>
  expense_trends: Array<{
    period: string
    amount: number
    growth_rate: number
  }>
  category_trends: Record<string, Array<{
    period: string
    amount: number
    percentage: number
  }>>
  savings_rate_trend: Array<{
    period: string
    rate: number
  }>
}
```

### 3. Componente de Filtros Avançados
```tsx
// src/components/reports/ReportFilters/ReportFilters.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/forms/Form/Form'
import { FormField } from '@/components/forms/FormField/FormField'
import { Input } from '@/components/forms/Input/Input'
import { Select } from '@/components/forms/Select/Select'
import { DatePicker } from '@/components/forms/DatePicker/DatePicker'
import { MoneyInput } from '@/components/forms/MoneyInput/MoneyInput'
import { Button } from '@/components/ui/Button/Button'
import { useCategories } from '@/hooks/useCategories'
import { AnalyticsFilters } from '@/types/analytics'

const filtersSchema = z.object({
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  category_ids: z.array(z.number()).optional(),
  transaction_type: z.enum(['income', 'expense']).optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
  period_preset: z.enum(['this_month', 'last_month', 'this_quarter', 'this_year', 'custom']).optional()
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return data.start_date <= data.end_date
  }
  return true
}, {
  message: 'Data inicial deve ser anterior à data final',
  path: ['end_date']
})

type FiltersFormData = z.infer<typeof filtersSchema>

interface ReportFiltersProps {
  initialFilters?: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  loading?: boolean
  showAdvanced?: boolean
}

export function ReportFilters({
  initialFilters = {},
  onFiltersChange,
  loading = false,
  showAdvanced = true
}: ReportFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const { data: categoriesData } = useCategories()

  const form = useForm<FiltersFormData>({
    resolver: zodResolver(filtersSchema),
    defaultValues: {
      start_date: initialFilters.start_date ? new Date(initialFilters.start_date) : undefined,
      end_date: initialFilters.end_date ? new Date(initialFilters.end_date) : undefined,
      category_ids: initialFilters.category_ids || [],
      transaction_type: initialFilters.transaction_type,
      min_amount: initialFilters.min_amount,
      max_amount: initialFilters.max_amount,
      period_preset: 'custom'
    }
  })

  const categories = categoriesData?.data || []
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
    color: category.color
  }))

  const periodPresetOptions = [
    { value: 'this_month', label: 'Este mês' },
    { value: 'last_month', label: 'Mês passado' },
    { value: 'this_quarter', label: 'Este trimestre' },
    { value: 'this_year', label: 'Este ano' },
    { value: 'custom', label: 'Período personalizado' }
  ]

  const transactionTypeOptions = [
    { value: 'income', label: 'Receitas' },
    { value: 'expense', label: 'Despesas' }
  ]

  const handlePeriodPresetChange = (preset: string) => {
    if (preset === 'custom') return

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (preset) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        break
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        return
    }

    form.setValue('start_date', startDate)
    form.setValue('end_date', endDate)
  }

  const onSubmit = (data: FiltersFormData) => {
    const filters: AnalyticsFilters = {
      start_date: data.start_date?.toISOString().split('T')[0],
      end_date: data.end_date?.toISOString().split('T')[0],
      category_ids: data.category_ids?.length ? data.category_ids : undefined,
      transaction_type: data.transaction_type,
      min_amount: data.min_amount,
      max_amount: data.max_amount
    }

    onFiltersChange(filters)
  }

  const handleClearFilters = () => {
    form.reset({
      start_date: undefined,
      end_date: undefined,
      category_ids: [],
      transaction_type: undefined,
      min_amount: undefined,
      max_amount: undefined,
      period_preset: 'custom'
    })
    onFiltersChange({})
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        {showAdvanced && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            {isAdvancedOpen ? 'Ocultar' : 'Mostrar'} filtros avançados
          </Button>
        )}
      </div>

      <Form form={form} onSubmit={onSubmit} className="space-y-4">
        {/* Period Preset */}
        <FormField name="period_preset" label="Período">
          <Select
            name="period_preset"
            options={periodPresetOptions}
            onChange={(value) => handlePeriodPresetChange(value)}
            isClearable={false}
            isSearchable={false}
          />
        </FormField>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField name="start_date" label="Data inicial">
            <DatePicker name="start_date" />
          </FormField>

          <FormField name="end_date" label="Data final">
            <DatePicker name="end_date" />
          </FormField>
        </div>

        {/* Advanced Filters */}
        {isAdvancedOpen && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="transaction_type" label="Tipo de transação">
                <Select
                  name="transaction_type"
                  options={transactionTypeOptions}
                  placeholder="Todos os tipos"
                />
              </FormField>

              <FormField name="category_ids" label="Categorias">
                <Select
                  name="category_ids"
                  options={categoryOptions}
                  placeholder="Todas as categorias"
                  isMulti
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="min_amount" label="Valor mínimo">
                <MoneyInput name="min_amount" placeholder="0,00" />
              </FormField>

              <FormField name="max_amount" label="Valor máximo">
                <MoneyInput name="max_amount" placeholder="0,00" />
              </FormField>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClearFilters}
          >
            Limpar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Aplicar Filtros
          </Button>
        </div>
      </Form>
    </div>
  )
}
```

### 4. Dashboard de Resumo Financeiro
```tsx
// src/components/reports/FinancialSummaryDashboard/FinancialSummaryDashboard.tsx
'use client'

import { useMemo } from 'react'
import { LineChart } from '@/components/charts/LineChart/LineChart'
import { PieChart } from '@/components/charts/PieChart/PieChart'
import { BarChart } from '@/components/charts/BarChart/BarChart'
import { FinancialSummary } from '@/types/analytics'
import { formatCurrency } from '@/lib/utils'
import { clsx } from 'clsx'

interface FinancialSummaryDashboardProps {
  data: FinancialSummary
  loading?: boolean
}

export function FinancialSummaryDashboard({ data, loading = false }: FinancialSummaryDashboardProps) {
  const chartData = useMemo(() => {
    if (!data) return { monthlyData: [], categoryData: [], trendsData: [] }

    // Monthly evolution data
    const monthlyData = data.monthly_breakdown.map(month => ({
      name: month.month_name,
      date: month.month,
      income: month.income,
      expense: month.expense,
      net: month.net
    }))

    // Category distribution data
    const categoryData = data.category_breakdown.map(category => ({
      name: category.category_name,
      value: category.amount,
      color: category.color
    }))

    // Growth trends data
    const trendsData = [
      {
        name: 'Receitas',
        value: data.summary.current_period.total_income,
        growth: data.summary.growth_rates.income_growth,
        color: '#10b981'
      },
      {
        name: 'Despesas',
        value: data.summary.current_period.total_expense,
        growth: data.summary.growth_rates.expense_growth,
        color: '#ef4444'
      },
      {
        name: 'Saldo',
        value: data.summary.current_period.net_amount,
        growth: data.summary.growth_rates.net_growth,
        color: '#3b82f6'
      }
    ]

    return { monthlyData, categoryData, trendsData }
  }, [data])

  if (loading) {
    return <div className="animate-pulse">Carregando dashboard...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total de Receitas"
          value={data.summary.current_period.total_income}
          growth={data.summary.growth_rates.income_growth}
          color="green"
        />
        <SummaryCard
          title="Total de Despesas"
          value={data.summary.current_period.total_expense}
          growth={data.summary.growth_rates.expense_growth}
          color="red"
        />
        <SummaryCard
          title="Saldo Líquido"
          value={data.summary.current_period.net_amount}
          growth={data.summary.growth_rates.net_growth}
          color={data.summary.current_period.net_amount >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Evolution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal</h3>
          <LineChart
            data={chartData.monthlyData}
            xAxisKey="name"
            yAxisKey="net"
            height={300}
            showArea
            strokeColor="#3b82f6"
            fillColor="#3b82f6"
          />
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
          <PieChart
            data={chartData.categoryData}
            dataKey="value"
            nameKey="name"
            height={300}
            showPercentage
          />
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maiores Despesas</h3>
          <div className="space-y-3">
            {data.top_transactions.expenses.slice(0, 5).map((transaction, index) => (
              <div key={transaction.id} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-600">{transaction.category?.name}</p>
                </div>
                <span className="font-semibold text-red-600">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
          <div className="space-y-4">
            {data.insights.slice(0, 3).map((insight, index) => (
              <div key={index} className={clsx(
                'p-4 rounded-lg border-l-4',
                {
                  'bg-green-50 border-green-400': insight.type === 'success',
                  'bg-yellow-50 border-yellow-400': insight.type === 'warning',
                  'bg-red-50 border-red-400': insight.type === 'error',
                  'bg-blue-50 border-blue-400': insight.type === 'info'
                }
              )}>
                <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                {insight.action && (
                  <p className="text-sm font-medium text-gray-800">{insight.action}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  growth: number
  color: 'green' | 'red' | 'blue'
}

function SummaryCard({ title, value, growth, color }: SummaryCardProps) {
  const isPositiveGrowth = growth > 0
  const isNegativeGrowth = growth < 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-center justify-between">
        <p className={clsx(
          'text-2xl font-bold',
          {
            'text-green-600': color === 'green',
            'text-red-600': color === 'red',
            'text-blue-600': color === 'blue'
          }
        )}>
          {formatCurrency(value)}
        </p>
        <div className={clsx(
          'flex items-center text-sm',
          {
            'text-green-600': isPositiveGrowth,
            'text-red-600': isNegativeGrowth,
            'text-gray-600': growth === 0
          }
        )}>
          {isPositiveGrowth && (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {isNegativeGrowth && (
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {Math.abs(growth).toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
```

### 5. Página Principal de Relatórios
```tsx
// src/app/reports/page.tsx
'use client'

import { useState } from 'react'
import { ReportFilters } from '@/components/reports/ReportFilters/ReportFilters'
import { FinancialSummaryDashboard } from '@/components/reports/FinancialSummaryDashboard/FinancialSummaryDashboard'
import { BudgetPerformanceDashboard } from '@/components/reports/BudgetPerformanceDashboard/BudgetPerformanceDashboard'
import { Button } from '@/components/ui/Button/Button'
import { useFinancialSummary, useBudgetPerformance, useExportReport } from '@/hooks/useAnalytics'
import { AnalyticsFilters } from '@/types/analytics'

type ReportTab = 'financial' | 'budget' | 'trends' | 'custom'

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('financial')
  const [filters, setFilters] = useState<AnalyticsFilters>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })

  const { data: financialData, isLoading: financialLoading } = useFinancialSummary(filters)
  const { data: budgetData, isLoading: budgetLoading } = useBudgetPerformance(filters)
  const { mutate: exportReport, isPending: exporting } = useExportReport()

  const tabs = [
    { id: 'financial', label: 'Resumo Financeiro', icon: '📊' },
    { id: 'budget', label: 'Performance de Orçamentos', icon: '🎯' },
    { id: 'trends', label: 'Tendências', icon: '📈' },
    { id: 'custom', label: 'Relatórios Personalizados', icon: '⚙️' }
  ]

  const handleExport = (format: 'pdf' | 'xlsx' | 'csv') => {
    const reportType = activeTab === 'financial' ? 'financial_summary' : 'budget_performance'
    exportReport({
      reportType,
      format,
      filters,
      name: `${reportType}-${new Date().toISOString().split('T')[0]}`
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-600 mt-2">
            Analise seus dados financeiros com relatórios detalhados e insights personalizados
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ReportFilters
            initialFilters={filters}
            onFiltersChange={setFilters}
            loading={financialLoading || budgetLoading}
          />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ReportTab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Export Actions */}
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('pdf')}
              loading={exporting}
            >
              Exportar PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('xlsx')}
              loading={exporting}
            >
              Exportar Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExport('csv')}
              loading={exporting}
            >
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'financial' && financialData && (
            <FinancialSummaryDashboard
              data={financialData.data}
              loading={financialLoading}
            />
          )}

          {activeTab === 'budget' && budgetData && (
            <BudgetPerformanceDashboard
              data={budgetData.data}
              loading={budgetLoading}
            />
          )}

          {activeTab === 'trends' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Análise de Tendências</h3>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios Personalizados</h3>
              <p className="text-gray-600">Em desenvolvimento...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 6. Testes dos Componentes
```tsx
// src/components/reports/FinancialSummaryDashboard/FinancialSummaryDashboard.test.tsx
import { render, screen } from '@/utils/test-utils'
import { FinancialSummaryDashboard } from './FinancialSummaryDashboard'

const mockData = {
  summary: {
    period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31',
      days_count: 31
    },
    current_period: {
      total_income: 5000,
      total_expense: 3000,
      net_amount: 2000,
      transaction_count: 25,
      avg_income: 1250,
      avg_expense: 150
    },
    previous_period: {
      total_income: 4500,
      total_expense: 2800,
      net_amount: 1700,
      transaction_count: 20
    },
    growth_rates: {
      income_growth: 11.11,
      expense_growth: 7.14,
      net_growth: 17.65
    }
  },
  monthly_breakdown: [
    {
      month: '2024-01',
      month_name: 'Janeiro 2024',
      income: 5000,
      expense: 3000,
      net: 2000
    }
  ],
  category_breakdown: [
    {
      category_name: 'Alimentação',
      color: '#ef4444',
      amount: 1500,
      percentage: 50,
      transaction_count: 15
    }
  ],
  top_transactions: {
    expenses: [],
    incomes: []
  },
  insights: [
    {
      type: 'success' as const,
      title: 'Crescimento na Renda',
      message: 'Sua renda aumentou 11.11% em relação ao período anterior.',
      action: 'Considere aumentar seus investimentos'
    }
  ],
  generated_at: '2024-01-31T23:59:59Z'
}

describe('FinancialSummaryDashboard', () => {
  it('renders summary cards with correct values', () => {
    render(<FinancialSummaryDashboard data={mockData} />)

    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument() // Total income
    expect(screen.getByText('R$ 3.000,00')).toBeInTheDocument() // Total expense
    expect(screen.getByText('R$ 2.000,00')).toBeInTheDocument() // Net amount
  })

  it('displays growth rates correctly', () => {
    render(<FinancialSummaryDashboard data={mockData} />)

    expect(screen.getByText('11.1%')).toBeInTheDocument() // Income growth
    expect(screen.getByText('7.1%')).toBeInTheDocument() // Expense growth
    expect(screen.getByText('17.7%')).toBeInTheDocument() // Net growth
  })

  it('renders charts section', () => {
    render(<FinancialSummaryDashboard data={mockData} />)

    expect(screen.getByText('Evolução Mensal')).toBeInTheDocument()
    expect(screen.getByText('Distribuição por Categoria')).toBeInTheDocument()
  })

  it('displays insights', () => {
    render(<FinancialSummaryDashboard data={mockData} />)

    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Crescimento na Renda')).toBeInTheDocument()
    expect(screen.getByText('Considere aumentar seus investimentos')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<FinancialSummaryDashboard data={mockData} loading={true} />)

    expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument()
  })
})
```

## Critérios de Sucesso
- [ ] Layout responsivo e intuitivo implementado
- [ ] Sistema de filtros avançados funcionando
- [ ] Dashboard de resumo financeiro completo
- [ ] Relatório de performance de orçamentos
- [ ] Gráficos interativos e informativos
- [ ] Sistema de exportação funcionando
- [ ] Performance otimizada com cache
- [ ] Navegação por tabs implementada
- [ ] Insights automáticos sendo gerados
- [ ] Testes unitários com cobertura 85%+

## Performance e UX
- Cache de dados por 5-10 minutos
- Loading states em todos os componentes
- Skeleton loaders para charts
- Debounce em filtros
- Lazy loading de componentes pesados

## Recursos Necessários
- Desenvolvedor frontend React sênior
- Designer UX para validação da interface
- Analista de dados para validação dos insights

## Tempo Estimado
- Layout e estrutura: 6-8 horas
- Sistema de filtros: 8-10 horas
- Dashboard financeiro: 10-12 horas
- Dashboard de orçamentos: 8-10 horas
- Sistema de exportação: 6-8 horas
- Otimização e performance: 6-8 horas
- Testes e documentação: 8-10 horas
- **Total**: 7-9 dias de trabalho