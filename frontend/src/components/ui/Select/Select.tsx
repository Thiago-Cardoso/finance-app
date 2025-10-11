import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
            {props.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'focus:border-primary-500 dark:focus:border-primary-400 focus:ring-primary-500 dark:focus:ring-primary-400',
            'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600',
            error && 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-400 placeholder-red-300 dark:placeholder-red-500 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
