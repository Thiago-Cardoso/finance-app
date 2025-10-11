import { HTMLAttributes, ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'rounded-lg p-4 flex items-start gap-3 border',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800',
        success: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800',
        error: 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800',
      }
    },
    defaultVariants: {
      variant: 'info',
    }
  }
)

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const iconColors = {
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
}

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  onClose?: () => void
  children: ReactNode
}

export function Alert({
  className,
  variant = 'info',
  title,
  children,
  onClose,
  ...props
}: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      className={cn(alertVariants({ variant, className }))}
      role="alert"
      {...props}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[variant])} />
      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
