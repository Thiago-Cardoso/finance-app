import { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const spacerVariants = cva(
  '',
  {
    variants: {
      size: {
        1: 'h-1 w-1',
        2: 'h-2 w-2',
        3: 'h-3 w-3',
        4: 'h-4 w-4',
        5: 'h-5 w-5',
        6: 'h-6 w-6',
        8: 'h-8 w-8',
        10: 'h-10 w-10',
        12: 'h-12 w-12',
        16: 'h-16 w-16',
      },
      axis: {
        horizontal: 'w-auto',
        vertical: 'h-auto',
        both: '',
      },
    },
    compoundVariants: [
      {
        axis: 'horizontal',
        size: 1,
        className: 'w-1 h-auto',
      },
      {
        axis: 'horizontal',
        size: 2,
        className: 'w-2 h-auto',
      },
      {
        axis: 'horizontal',
        size: 3,
        className: 'w-3 h-auto',
      },
      {
        axis: 'horizontal',
        size: 4,
        className: 'w-4 h-auto',
      },
      {
        axis: 'horizontal',
        size: 5,
        className: 'w-5 h-auto',
      },
      {
        axis: 'horizontal',
        size: 6,
        className: 'w-6 h-auto',
      },
      {
        axis: 'horizontal',
        size: 8,
        className: 'w-8 h-auto',
      },
      {
        axis: 'horizontal',
        size: 10,
        className: 'w-10 h-auto',
      },
      {
        axis: 'horizontal',
        size: 12,
        className: 'w-12 h-auto',
      },
      {
        axis: 'horizontal',
        size: 16,
        className: 'w-16 h-auto',
      },
      {
        axis: 'vertical',
        size: 1,
        className: 'h-1 w-auto',
      },
      {
        axis: 'vertical',
        size: 2,
        className: 'h-2 w-auto',
      },
      {
        axis: 'vertical',
        size: 3,
        className: 'h-3 w-auto',
      },
      {
        axis: 'vertical',
        size: 4,
        className: 'h-4 w-auto',
      },
      {
        axis: 'vertical',
        size: 5,
        className: 'h-5 w-auto',
      },
      {
        axis: 'vertical',
        size: 6,
        className: 'h-6 w-auto',
      },
      {
        axis: 'vertical',
        size: 8,
        className: 'h-8 w-auto',
      },
      {
        axis: 'vertical',
        size: 10,
        className: 'h-10 w-auto',
      },
      {
        axis: 'vertical',
        size: 12,
        className: 'h-12 w-auto',
      },
      {
        axis: 'vertical',
        size: 16,
        className: 'h-16 w-auto',
      },
    ],
    defaultVariants: {
      size: 4,
      axis: 'both',
    }
  }
)

export interface SpacerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {}

export function Spacer({
  className,
  size,
  axis,
  ...props
}: SpacerProps) {
  return (
    <div
      className={cn(spacerVariants({ size, axis, className }))}
      aria-hidden="true"
      {...props}
    />
  )
}

Spacer.displayName = 'Spacer'
