'use client'

import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
  labelKey?: string
  valueKey?: string
  formatter?: (value: any, name: string) => [string, string]
}

export function CustomTooltip({
  active,
  payload,
  label,
  labelKey = 'date',
  valueKey = 'value',
  formatter
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const formatLabel = (label: string) => {
    if (!label) return ''

    try {
      return format(parseISO(label), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
    } catch {
      return label
    }
  }

  const formatValue = (value: any, name: string) => {
    if (formatter) {
      return formatter(value, name)
    }

    if (typeof value === 'number') {
      return [formatCurrency(value), name]
    }

    return [value, name]
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
      {label && (
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          {formatLabel(label)}
        </p>
      )}

      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name || entry.dataKey}:
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatValue(entry.value, entry.name)[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
