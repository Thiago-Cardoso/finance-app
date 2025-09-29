import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, type = 'text', error, required = false, disabled = false, ...props },
    ref
  ) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none',
            error ? 'border-red-500' : 'border-gray-300',
            disabled && 'cursor-not-allowed bg-gray-100',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
