'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
]

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onChange(color)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`
              w-10 h-10 rounded-lg border-2 transition-all
              hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${value === color ? 'border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'}
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          >
            {value === color && (
              <Check className="w-5 h-5 mx-auto text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showCustom}
            onChange={(e) => setShowCustom(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Custom color</span>
        </label>
      </div>

      {showCustom && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <input
            type="color"
            value={customColor}
            onChange={(e) => handleCustomColorChange(e.target.value)}
            className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            aria-label="Custom color picker"
          />
          <div className="flex-1">
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#000000"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      )}
    </div>
  )
}
