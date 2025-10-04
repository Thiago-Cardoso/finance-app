import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { clsx } from 'clsx'

interface SummaryData {
  current_month: {
    income: number
    expenses: number
    balance: number
    transactions_count: number
  }
  previous_month: {
    income: number
    expenses: number
    balance: number
  }
  variation: {
    percentage: number
    trend: 'up' | 'down' | 'stable'
    amount: number
  }
}

interface SummaryCardsProps {
  data?: SummaryData
  currentBalance?: { raw: number; formatted: string }
}

export function SummaryCards({ data, currentBalance }: SummaryCardsProps) {
  if (!data || !currentBalance) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="relative bg-white rounded-2xl shadow-xl p-6 animate-pulse overflow-hidden border border-gray-100"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gray-200 to-gray-300" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    )
  }

  const income = data.current_month.income
  const expenses = data.current_month.expenses
  const balance = data.current_month.balance
  const totalBalance = currentBalance.raw

  const cards = [
    {
      title: 'Receitas do Mês',
      value: income,
      change: 0,
      icon: TrendingUp,
      colorHex: '#10b981',
      gradientFrom: '#10b981',
      gradientTo: '#14b8a6'
    },
    {
      title: 'Despesas do Mês',
      value: expenses,
      change: 0,
      icon: TrendingDown,
      colorHex: '#f43f5e',
      gradientFrom: '#f43f5e',
      gradientTo: '#ec4899'
    },
    {
      title: 'Saldo do Mês',
      value: balance,
      change: data.variation.percentage,
      icon: Wallet,
      colorHex: balance >= 0 ? '#10b981' : '#f43f5e',
      gradientFrom: balance >= 0 ? '#10b981' : '#f43f5e',
      gradientTo: balance >= 0 ? '#14b8a6' : '#ec4899',
      trend: data.variation.trend
    },
    {
      title: 'Saldo Total',
      value: totalBalance,
      change: 0,
      icon: Target,
      colorHex: '#3b82f6',
      gradientFrom: '#3b82f6',
      gradientTo: '#6366f1'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isPositiveChange = card.change > 0

        return (
          <div
            key={index}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100/50"
          >
            {/* Gradient accent bar at top - dynamic color */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 opacity-90"
              style={{
                background: `linear-gradient(90deg, ${card.gradientFrom}, ${card.gradientTo})`
              }}
            />

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${card.colorHex} 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }} />

            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center">
                  {card.title}
                  <span className="ml-2 w-1 h-1 rounded-full" style={{ backgroundColor: card.colorHex }} />
                </p>
                <p className="text-3xl font-black mb-2" style={{ color: card.colorHex }}>
                  {formatCurrency(Math.abs(card.value))}
                </p>

                {card.change !== 0 && (
                  <div className="flex items-center mt-3">
                    <div
                      className="flex items-center px-2.5 py-1.5 rounded-full shadow-sm"
                      style={{
                        backgroundColor: `${isPositiveChange ? '#10b981' : '#f43f5e'}15`,
                        border: `1px solid ${isPositiveChange ? '#10b981' : '#f43f5e'}30`
                      }}
                    >
                      {isPositiveChange ? (
                        <TrendingUp className="w-3.5 h-3.5 mr-1.5" style={{ color: '#10b981' }} />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 mr-1.5" style={{ color: '#f43f5e' }} />
                      )}
                      <span
                        className="text-xs font-bold"
                        style={{ color: isPositiveChange ? '#10b981' : '#f43f5e' }}
                      >
                        {isPositiveChange && '+'}{Math.abs(card.change).toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 font-medium">vs anterior</span>
                  </div>
                )}
              </div>

              <div
                className="p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${card.colorHex}15, ${card.colorHex}25)`
                }}
              >
                <Icon className="w-7 h-7" style={{ color: card.colorHex }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
