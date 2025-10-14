'use client'

import { useMemo } from 'react'
import { BarChart } from '@/components/charts/BarChart/BarChart'
import { BudgetPerformance } from '@/types/analytics'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, DollarSign, Target } from 'lucide-react'

interface BudgetPerformanceDashboardProps {
  data: BudgetPerformance
  loading?: boolean
  className?: string
}

interface OverallSummaryCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: React.ReactNode
  color?: 'green' | 'red' | 'blue' | 'yellow'
}

function OverallSummaryCard({ label, value, sublabel, icon, color = 'blue' }: OverallSummaryCardProps) {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700',
    red: 'from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700',
    blue: 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700',
    yellow: 'from-yellow-500 to-orange-600 dark:from-yellow-600 dark:to-orange-700'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        {icon && (
          <div className={cn('p-2 rounded-lg bg-gradient-to-br', colorClasses[color])}>
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {sublabel && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sublabel}</p>}
    </div>
  )
}

interface BudgetCardProps {
  budget: BudgetPerformance['budgets'][0]
}

function BudgetCard({ budget }: BudgetCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
      case 'ahead_of_schedule':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'warning':
      case 'behind_schedule':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'over_budget':
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'on_track': 'No Caminho',
      'over_budget': 'Acima do Orçamento',
      'critical': 'Crítico',
      'ahead_of_schedule': 'Adiantado',
      'behind_schedule': 'Atrasado',
      'warning': 'Atenção'
    }
    return labels[status] || status
  }

  const getProgressColor = (usage: number) => {
    if (usage >= 100) return 'bg-red-500'
    if (usage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {budget.budget_name}
          </h4>
          {budget.category_name && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              {budget.category_color && (
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: budget.category_color }}
                />
              )}
              {budget.category_name}
            </p>
          )}
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor(budget.status))}>
          {getStatusLabel(budget.status)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progresso</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {budget.usage_percentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', getProgressColor(budget.usage_percentage))}
            style={{ width: `${Math.min(budget.usage_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Orçamento</p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(budget.amount || budget.allocated_amount || 0)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Gasto</p>
          <p className="font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(budget.spent || budget.spent_amount || 0)}
          </p>
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">Restante</p>
          <p className={cn(
            'font-semibold',
            (budget.remaining || budget.remaining_amount || 0) >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {formatCurrency(budget.remaining || budget.remaining_amount || 0)}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      {(budget.daily_average !== undefined || budget.projected_total !== undefined) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm space-y-2">
          {budget.daily_average !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Média diária</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(budget.daily_average)}
              </span>
            </div>
          )}
          {budget.projected_total !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Projeção total</span>
              <span className={cn(
                'font-medium',
                budget.projected_total > (budget.amount || budget.allocated_amount || 0)
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              )}>
                {formatCurrency(budget.projected_total)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function BudgetPerformanceDashboard({ data, loading = false, className }: BudgetPerformanceDashboardProps) {
  const chartData = useMemo(() => {
    if (!data || !data.budgets) return []

    return data.budgets.map(budget => ({
      name: budget.budget_name,
      Orçado: budget.amount || budget.allocated_amount || 0,
      Gasto: budget.spent || budget.spent_amount || 0,
      Restante: Math.max(0, (budget.remaining || budget.remaining_amount || 0))
    }))
  }, [data])

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500 dark:text-gray-400">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <OverallSummaryCard
          label="Total Orçado"
          value={formatCurrency(data.overall.total_budget)}
          icon={<Target className="w-5 h-5" />}
          color="blue"
        />
        <OverallSummaryCard
          label="Total Gasto"
          value={formatCurrency(data.overall.total_spent)}
          sublabel={`${data.overall.usage_percentage.toFixed(1)}% utilizado`}
          icon={<DollarSign className="w-5 h-5" />}
          color="red"
        />
        <OverallSummaryCard
          label="Total Restante"
          value={formatCurrency(data.overall.remaining)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
        <OverallSummaryCard
          label="Orçamentos"
          value={`${data.overall.budget_count}`}
          sublabel={`${data.overall.over_budget_count} acima do limite`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={data.overall.over_budget_count > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Budgets Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Visão Geral dos Orçamentos
          </h3>
          <BarChart
            data={chartData}
            xAxisKey="name"
            bars={[
              { key: 'Orçado', color: '#3b82f6' },
              { key: 'Gasto', color: '#ef4444' },
            ]}
            height={300}
          />
        </div>
      )}

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.budgets.map((budget) => (
          <BudgetCard key={budget.budget_id} budget={budget} />
        ))}
      </div>

      {/* Alerts & Recommendations */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Alertas e Recomendações
          </h3>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-lg border-l-4 flex items-start space-x-3',
                  alert.type === 'critical' && 'bg-red-50 dark:bg-red-900/20 border-red-400',
                  alert.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400',
                  alert.type === 'urgent' && 'bg-orange-50 dark:bg-orange-900/20 border-orange-400',
                  alert.type === 'info' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-400',
                  alert.type === 'success' && 'bg-green-50 dark:bg-green-900/20 border-green-400'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {alert.type === 'critical' && <XCircle className="w-5 h-5 text-red-600" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  {alert.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{alert.message}</p>
                  {alert.budget_name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Orçamento: {alert.budget_name}
                    </p>
                  )}
                  {alert.actions && alert.actions.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                      {alert.actions.map((action, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">
                          • {action}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-4">
          <span>
            <strong>Período:</strong> {data.period.start_date} até {data.period.end_date}
          </span>
          {data.generated_at && (
            <span>
              <strong>Gerado em:</strong> {new Date(data.generated_at).toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
