import { formatCurrency } from '@/lib/utils'
import { Target, Calendar } from 'lucide-react'

interface Goal {
  goal_id: string
  title: string
  target_amount: number
  current_amount: number
  progress_percentage: number
  days_remaining: number | null
  target_date: string | null
}

interface GoalsProgressProps {
  data?: Goal[]
}

export function GoalsProgress({ data }: GoalsProgressProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Progresso de Metas
        </h3>
        <div className="text-center py-8 text-gray-500">
          Nenhuma meta ativa
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Progresso de Metas
          </h3>
          <div className="p-3 rounded-xl shadow-lg" style={{
            background: 'linear-gradient(135deg, #6366f115, #8b5cf625)'
          }}>
            <Target className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
        </div>

        <div className="space-y-4">
          {data.map((goal) => {
            const progressColors = goal.progress_percentage >= 75
              ? { from: '#10b981', to: '#14b8a6', text: '#059669' }
              : goal.progress_percentage >= 50
              ? { from: '#3b82f6', to: '#6366f1', text: '#2563eb' }
              : goal.progress_percentage >= 25
              ? { from: '#f59e0b', to: '#f97316', text: '#ea580c' }
              : { from: '#9ca3af', to: '#6b7280', text: '#6b7280' }

            return (
              <div
                key={goal.goal_id}
                className="p-5 bg-white/60 rounded-2xl shadow-md hover:shadow-xl border border-gray-100/50 hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-gray-900 truncate flex items-center">
                    <div
                      className="w-1.5 h-1.5 rounded-full mr-2 shadow-sm"
                      style={{ backgroundColor: progressColors.text }}
                    />
                    {goal.title}
                  </h4>
                  <span
                    className="text-base font-black px-3 py-1.5 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: `${progressColors.text}15`,
                      color: progressColors.text,
                      border: `1px solid ${progressColors.text}30`
                    }}
                  >
                    {goal.progress_percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner mb-4">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(90deg, ${progressColors.from}, ${progressColors.to})`
                    }}
                  />
                  <div
                    className="relative h-full transition-all duration-700 ease-out shadow-lg group-hover:shadow-xl"
                    style={{
                      width: `${Math.min(goal.progress_percentage, 100)}%`,
                      background: `linear-gradient(90deg, ${progressColors.from}, ${progressColors.to})`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-700">
                    <span style={{ color: progressColors.text }}>
                      {formatCurrency(goal.current_amount)}
                    </span>
                    <span className="text-gray-400 mx-1.5">de</span>
                    <span className="text-gray-600">
                      {formatCurrency(goal.target_amount)}
                    </span>
                  </span>
                  {goal.days_remaining !== null && (
                    <div
                      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full shadow-sm"
                      style={{
                        backgroundColor: goal.days_remaining > 0 ? `${progressColors.text}15` : '#fee2e215',
                        border: `1px solid ${goal.days_remaining > 0 ? `${progressColors.text}30` : '#fee2e230'}`
                      }}
                    >
                      <Calendar
                        className="w-3.5 h-3.5"
                        style={{ color: goal.days_remaining > 0 ? progressColors.text : '#ef4444' }}
                      />
                      <span
                        className="font-bold"
                        style={{ color: goal.days_remaining > 0 ? progressColors.text : '#ef4444' }}
                      >
                        {goal.days_remaining > 0
                          ? `${goal.days_remaining} dias`
                          : 'Vencido'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
