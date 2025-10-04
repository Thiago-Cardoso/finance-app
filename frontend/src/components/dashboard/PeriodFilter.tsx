import { Button } from '@/components/ui/Button'
import { Calendar } from 'lucide-react'

interface PeriodFilterProps {
  period: {
    start: Date
    end: Date
  }
  onPeriodChange: (period: { start: Date; end: Date }) => void
}

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  const presets = [
    {
      label: 'Este Mês',
      getValue: () => ({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
      })
    },
    {
      label: 'Mês Passado',
      getValue: () => {
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        return {
          start: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          end: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        }
      }
    },
    {
      label: 'Últimos 3 Meses',
      getValue: () => {
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        return {
          start: threeMonthsAgo,
          end: new Date()
        }
      }
    }
  ]

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg shadow-md p-1 border border-gray-100">
      {presets.map((preset) => (
        <Button
          key={preset.label}
          variant="secondary"
          size="sm"
          onClick={() => onPeriodChange(preset.getValue())}
          className="text-sm font-semibold hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-200"
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
