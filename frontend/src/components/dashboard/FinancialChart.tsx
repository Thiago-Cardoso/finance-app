'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useLocale } from '@/contexts/LocaleContext'

interface MonthlyData {
  month: string
  month_name: string
  income: number
  expenses: number
  balance: number
}

interface FinancialChartProps {
  data?: MonthlyData[]
}

export function FinancialChart({ data }: FinancialChartProps) {
  const { t, formatCurrency } = useLocale()

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('dashboard.charts.monthlyTrend')}
        </h3>
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          {t('dashboard.noData')}
        </div>
      </div>
    )
  }

  const chartData = data.map(item => {
    // Extrair nome do mês da string month (formato: YYYY-MM)
    const monthNumber = item.month ? parseInt(item.month.split('-')[1]) : 0
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    const monthLabel = monthNumber > 0 && monthNumber <= 12 ? monthNames[monthNumber - 1] : item.month || ''

    return {
      month: monthLabel,
      income: Number(item.income) || 0,
      expenses: Number(item.expenses) || 0,
      balance: Number(item.balance) || 0
    }
  })

  // Custom tooltip with proper typing
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; dataKey: string; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
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
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {t('dashboard.charts.monthlyTrend')}
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></div>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t('dashboard.summary.income')}</span>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-full">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2"></div>
            <span className="font-semibold text-rose-700 dark:text-rose-400">{t('dashboard.summary.expenses')}</span>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-semibold text-blue-700 dark:text-blue-400">{t('dashboard.summary.balance')}</span>
          </div>
        </div>
      </div>

      <div className="h-80 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              name={t('dashboard.summary.income')}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              name={t('dashboard.summary.expenses')}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              name={t('dashboard.summary.balance')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
