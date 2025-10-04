'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CategoryData {
  category_name: string
  amount: number
  percentage: number
  color: string
}

interface TopCategoriesProps {
  data?: CategoryData[]
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export function TopCategories({ data }: TopCategoriesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Categorias (Gastos)
        </h3>
        <div className="text-center py-8 text-gray-500">
          Dados não disponíveis
        </div>
      </div>
    )
  }

  const chartData = data.map((item, index) => ({
    name: item.category_name,
    value: item.amount,
    percentage: item.percentage,
    color: item.color || COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number; percentage: number } }> }) => {
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
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-pink-50/30 pointer-events-none" />

      <div className="relative">
        <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center">
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Top Categorias
          </span>
          <span className="ml-2 text-sm font-normal text-gray-400">(Gastos)</span>
        </h3>

        <div className="h-52 mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white rounded-2xl shadow-inner" />
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`categoryGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#categoryGradient-${index})`}
                    stroke="#fff"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {data.slice(0, 5).map((category, index) => {
            const categoryColor = category.color || COLORS[index % COLORS.length]
            return (
              <div
                key={index}
                className="group flex items-center justify-between p-3.5 rounded-xl bg-white/60 hover:bg-white border border-gray-100/50 hover:border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}30)`
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ backgroundColor: categoryColor }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 truncate">
                    {category.category_name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black" style={{ color: categoryColor }}>
                    {formatCurrency(category.amount)}
                  </div>
                  <div
                    className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      color: categoryColor
                    }}
                  >
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
