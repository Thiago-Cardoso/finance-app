import { Button } from '@/components/ui/Button'
import { Plus, TrendingUp, TrendingDown, ArrowRightLeft, PieChart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      label: 'Nova Receita',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-teal-700',
      shadowColor: 'shadow-emerald-500/50',
      onClick: () => router.push('/transactions/new?type=income')
    },
    {
      label: 'Nova Despesa',
      icon: TrendingDown,
      gradient: 'from-rose-500 to-pink-600',
      hoverGradient: 'hover:from-rose-600 hover:to-pink-700',
      shadowColor: 'shadow-rose-500/50',
      onClick: () => router.push('/transactions/new?type=expense')
    },
    {
      label: 'Transferência',
      icon: ArrowRightLeft,
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
      shadowColor: 'shadow-blue-500/50',
      onClick: () => router.push('/transactions/new?type=transfer')
    },
    {
      label: 'Ver Relatórios',
      icon: PieChart,
      gradient: 'from-purple-500 to-violet-600',
      hoverGradient: 'hover:from-purple-600 hover:to-violet-700',
      shadowColor: 'shadow-purple-500/50',
      onClick: () => router.push('/reports')
    }
  ]

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
        <Plus className="w-5 h-5 mr-2 text-gray-600" />
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`group relative bg-gradient-to-br ${action.gradient} ${action.hoverGradient} text-white rounded-xl p-5 shadow-lg ${action.shadowColor} hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center space-y-3 overflow-hidden`}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

              <div className="relative z-10 bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
              </div>
              <span className="relative z-10 text-sm font-bold tracking-wide">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
