'use client'

import { Check } from 'lucide-react'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  className?: string
}

const PRESET_ICONS = [
  '🏠', '🏢', '🏦', '💰', '💳', '💵',
  '🛒', '🍔', '☕', '🍕', '🎬', '🎮',
  '⚡', '💡', '🔧', '🚗', '✈️', '🏥',
  '📚', '🎓', '👕', '👟', '💄', '🎁',
  '📱', '💻', '🖥️', '⌚', '📷', '🎵',
  '🏋️', '⚽', '🏃', '🧘', '🎨', '🌳',
]

export function IconPicker({ value, onChange, className = '' }: IconPickerProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_ICONS.map((icon) => (
          <button
            key={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`
              relative w-12 h-12 rounded-lg border-2 transition-all text-2xl
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${
                value === icon
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }
            `}
            aria-label={`Select icon ${icon}`}
          >
            <span className="block w-full h-full flex items-center justify-center">
              {icon}
            </span>
            {value === icon && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Custom:
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter emoji"
          maxLength={2}
          className="flex-1 px-3 py-2 text-lg border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
