import { forwardRef, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
      },
      state: {
        default: 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400',
        error: 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
        success: 'border-green-500 dark:border-green-400 focus:border-green-500 dark:focus:border-green-400 focus:ring-green-500 dark:focus:ring-green-400',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    }
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, label, error, success, helperText, leftIcon, rightIcon, required, disabled, ...props }, ref) => {
    const inputState = error ? 'error' : success ? 'success' : 'default'

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              inputVariants({
                size,
                state: inputState,
                className
              }),
              leftIcon && 'pl-10',
              (rightIcon || error || success) && 'pr-10',
              disabled && 'cursor-not-allowed bg-gray-100 dark:bg-gray-900 opacity-60'
            )}
            {...props}
          />

          {(rightIcon || error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {error && <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />}
              {success && <Check className="w-5 h-5 text-green-500 dark:text-green-400" />}
              {!error && !success && rightIcon}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <p className={cn(
            'text-sm',
            error && 'text-red-600 dark:text-red-400',
            success && 'text-green-600 dark:text-green-400',
            !error && !success && 'text-gray-500 dark:text-gray-400'
          )}>
            {error || success || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
