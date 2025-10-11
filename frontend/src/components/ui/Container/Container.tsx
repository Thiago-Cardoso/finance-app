import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const containerVariants = cva(
  'mx-auto w-full',
  {
    variants: {
      maxWidth: {
        sm: 'max-w-screen-sm',    // 640px
        md: 'max-w-screen-md',    // 768px
        lg: 'max-w-screen-lg',    // 1024px
        xl: 'max-w-screen-xl',    // 1280px
        '2xl': 'max-w-screen-2xl', // 1536px
        '7xl': 'max-w-7xl',       // 1280px custom
        full: 'max-w-full',
      },
      padding: {
        none: 'px-0',
        sm: 'px-4',
        md: 'px-6',
        lg: 'px-8',
      },
      centered: {
        true: 'flex flex-col items-center',
      }
    },
    defaultVariants: {
      maxWidth: '7xl',
      padding: 'md',
      centered: false,
    }
  }
)

export interface ContainerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, centered, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(containerVariants({ maxWidth, padding, centered, className }))}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'
