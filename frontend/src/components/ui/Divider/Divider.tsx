import { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const dividerVariants = cva(
  'border-gray-200 dark:border-gray-700',
  {
    variants: {
      orientation: {
        horizontal: 'w-full border-t',
        vertical: 'h-full border-l',
      },
      spacing: {
        none: '',
        sm: '',
        md: '',
        lg: '',
      },
      variant: {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
      },
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        spacing: 'sm',
        className: 'my-2',
      },
      {
        orientation: 'horizontal',
        spacing: 'md',
        className: 'my-4',
      },
      {
        orientation: 'horizontal',
        spacing: 'lg',
        className: 'my-6',
      },
      {
        orientation: 'vertical',
        spacing: 'sm',
        className: 'mx-2',
      },
      {
        orientation: 'vertical',
        spacing: 'md',
        className: 'mx-4',
      },
      {
        orientation: 'vertical',
        spacing: 'lg',
        className: 'mx-6',
      },
    ],
    defaultVariants: {
      orientation: 'horizontal',
      spacing: 'md',
      variant: 'solid',
    }
  }
)

export interface DividerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof dividerVariants> {
  label?: ReactNode
}

export function Divider({
  className,
  orientation = 'horizontal',
  spacing,
  variant,
  label,
  ...props
}: DividerProps) {
  if (label && orientation === 'horizontal') {
    return (
      <div
        className={cn(
          'flex items-center',
          spacing === 'sm' && 'my-2',
          spacing === 'md' && 'my-4',
          spacing === 'lg' && 'my-6',
          className
        )}
        role="separator"
        {...props}
      >
        <div className={cn('flex-1', dividerVariants({ orientation, spacing: 'none', variant }))} />
        <span className="px-3 text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <div className={cn('flex-1', dividerVariants({ orientation, spacing: 'none', variant }))} />
      </div>
    )
  }

  if (label && orientation === 'vertical') {
    return (
      <div
        className={cn(
          'flex flex-col items-center',
          spacing === 'sm' && 'mx-2',
          spacing === 'md' && 'mx-4',
          spacing === 'lg' && 'mx-6',
          className
        )}
        role="separator"
        {...props}
      >
        <div className={cn('flex-1', dividerVariants({ orientation, spacing: 'none', variant }))} />
        <span className="py-3 text-sm text-gray-500 dark:text-gray-400 writing-mode-vertical">{label}</span>
        <div className={cn('flex-1', dividerVariants({ orientation, spacing: 'none', variant }))} />
      </div>
    )
  }

  return (
    <div
      className={cn(dividerVariants({ orientation, spacing, variant, className }))}
      role="separator"
      {...props}
    />
  )
}

Divider.displayName = 'Divider'
