import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
        outlined: 'border-2',
        ghost: 'border-0 shadow-none',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer',
      }
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    }
  }
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hoverable, className }))}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

// Subcomponentes para composição
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border-b border-gray-200 dark:border-gray-700 pb-4 mb-4', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-bold text-gray-900 dark:text-gray-100', className)}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(className)}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border-t border-gray-200 dark:border-gray-700 pt-4 mt-4', className)}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'
