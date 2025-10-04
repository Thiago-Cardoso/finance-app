'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

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
    month: item.month_name ? item.month_name.split(' ')[0].substring(0, 3) : item.month || '',
    receitas: item.income,
    despesas: item.expenses,
    saldo: item.balance
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">
          Evolução Financeira
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center px-3 py-1.5 bg-emerald-50 rounded-full">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2"></div>
            <span className="font-semibold text-emerald-700">Receitas</span>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-rose-50 rounded-full">
            <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-2"></div>
            <span className="font-semibold text-rose-700">Despesas</span>
          </div>
          <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-full">
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-2"></div>
            <span className="font-semibold text-blue-700">Saldo</span>
          </div>
        </div>
      </div>

      <div className="h-80 bg-white rounded-lg p-4 shadow-inner">
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
              dataKey="receitas"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="despesas"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
