'use client'

import { useMemo } from 'react'
import { LineChart } from '@/components/charts/LineChart/LineChart'
import { PieChart } from '@/components/charts/PieChart/PieChart'
import { BarChart } from '@/components/charts/BarChart/BarChart'
import { FinancialSummary } from '@/types/analytics'
import { formatCurrency } from '@/lib/utils'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react'

interface FinancialSummaryDashboardProps {
  data: FinancialSummary
  loading?: boolean
  className?: string
}

interface SummaryCardProps {
  title: string
  value: number
  growth?: number
  color: 'green' | 'red' | 'blue'
  icon?: React.ReactNode
}

function SummaryCard({ title, value, growth, color, icon }: SummaryCardProps) {
  const { t } = useLocale()
  const isPositiveGrowth = growth !== undefined && growth > 0
  const isNegativeGrowth = growth !== undefined && growth < 0
  const isNeutralGrowth = growth === 0

  const colorClasses = {
    green: 'from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700',
    red: 'from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700',
    blue: 'from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        {icon && (
          <div className={cn(
            'p-2 rounded-lg bg-gradient-to-br',
            colorClasses[color]
          )}>
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className={cn(
          'text-3xl font-bold',
          color === 'green' && 'text-green-600 dark:text-green-400',
          color === 'red' && 'text-red-600 dark:text-red-400',
          color === 'blue' && 'text-blue-600 dark:text-blue-400'
        )}>
          {formatCurrency(value)}
        </p>

        {growth !== undefined && (
          <div className="flex items-center space-x-1">
            {isPositiveGrowth && <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />}
            {isNegativeGrowth && <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />}
            {isNeutralGrowth && <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
            <span className={cn(
              'text-sm font-medium',
              isPositiveGrowth && 'text-green-600 dark:text-green-400',
              isNegativeGrowth && 'text-red-600 dark:text-red-400',
              isNeutralGrowth && 'text-gray-600 dark:text-gray-400'
            )}>
              {isPositiveGrowth && '+'}{Math.abs(growth).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{t('reports.summary.vsPrevious')}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function FinancialSummaryDashboard({ data, loading = false, className }: FinancialSummaryDashboardProps) {
  const { t, formatCurrency: formatCurrencyLocale } = useLocale()
  const chartData = useMemo(() => {
    if (!data) return { monthlyData: [], categoryData: [], trendsData: [] }

    // Monthly evolution data
    const monthlyData = (data.monthly_breakdown || []).map(month => ({
      name: month.month_name,
      date: month.month,
      income: month.income,
      expenses: month.expense,
      balance: month.net
    }))

    // Category distribution data (expenses)
    const categoryData = (data.expenses?.breakdown || data.category_breakdown || [])
      .filter(cat => cat.amount > 0)
      .map(category => ({
        name: category.category_name,
        value: category.amount,
        color: category.category_color || category.color || '#6366f1'
      }))

    return { monthlyData, categoryData }
  }, [data])

  if (loading) {
    return (
      <div className={cn('animate-pulse space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500 dark:text-gray-400">{t('reports.noData')}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title={t('reports.summary.totalIncome')}
          value={data.summary.total_income}
          growth={data.comparisons?.previous_period?.income_growth}
          color="green"
          icon={<ArrowUpCircle className="w-5 h-5" />}
        />
        <SummaryCard
          title={t('reports.summary.totalExpenses')}
          value={data.summary.total_expenses}
          growth={data.comparisons?.previous_period?.expense_growth}
          color="red"
          icon={<ArrowDownCircle className="w-5 h-5" />}
        />
        <SummaryCard
          title={t('reports.summary.netBalance')}
          value={data.summary.net_balance}
          growth={data.comparisons?.previous_period?.net_growth}
          color={data.summary.net_balance >= 0 ? 'green' : 'red'}
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Evolution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('reports.charts.monthlyEvolution')}
          </h3>
          {chartData.monthlyData.length > 0 ? (
            <BarChart
              data={chartData.monthlyData}
              xAxisKey="name"
              bars={[
                { key: 'income', color: '#10b981' },
                { key: 'expenses', color: '#ef4444' }
              ]}
              height={300}
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('reports.charts.noDataToDisplay')}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('reports.charts.categoryDistribution')}
          </h3>
          {chartData.categoryData.length > 0 ? (
            <PieChart
              data={chartData.categoryData}
              dataKey="value"
              nameKey="name"
              height={300}
              showPercentage
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t('reports.charts.noDataToDisplay')}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Transactions */}
        {data.top_transactions && data.top_transactions.expenses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('reports.topTransactions.expenses')}
            </h3>
            <div className="space-y-3">
              {data.top_transactions.expenses.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </p>
                    {transaction.category && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.category.name}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400 ml-4">
                    {formatCurrency(Number(transaction.raw_amount || transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('reports.insights.title')}
            </h3>
            <div className="space-y-4">
              {data.insights.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border-l-4',
                    insight.type === 'success' && 'bg-green-50 dark:bg-green-900/20 border-green-400',
                    insight.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400',
                    insight.type === 'error' && 'bg-red-50 dark:bg-red-900/20 border-red-400',
                    insight.type === 'info' && 'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                  )}
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {insight.message}
                  </p>
                  {insight.action && (
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      💡 {insight.action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Period Information */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-wrap gap-4">
          <span>
            <strong>{t('reports.periodInfo.period')}:</strong> {data.period.start_date} {t('reports.periodInfo.to')} {data.period.end_date}
          </span>
          <span>
            <strong>{t('reports.summary.transactionCount')}:</strong> {data.summary.transaction_count}
          </span>
          {data.generated_at && (
            <span>
              <strong>{t('reports.summary.generatedAt')}:</strong> {new Date(data.generated_at).toLocaleString(formatCurrencyLocale === formatCurrency ? 'en-US' : 'pt-BR')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
