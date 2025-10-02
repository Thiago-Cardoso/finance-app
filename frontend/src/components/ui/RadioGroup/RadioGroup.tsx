import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface RadioOption {
  value: string
  label: string
  color?: string
}

export interface RadioGroupProps {
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  name: string
  className?: string
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ options, value, onChange, name, className }, ref) => {
    return (
      <div className={cn('flex gap-4', className)}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              ref={ref}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <span className={cn('text-sm font-medium', option.color || 'text-gray-700')}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'
