import { forwardRef, HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const gridVariants = cva(
  'grid',
  {
    variants: {
      cols: {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
        12: 'grid-cols-12',
      },
      gap: {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        5: 'gap-5',
        6: 'gap-6',
        8: 'gap-8',
        10: 'gap-10',
        12: 'gap-12',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
    },
    defaultVariants: {
      cols: 1,
      gap: 4,
      align: 'stretch',
      justify: 'start',
    }
  }
)

export interface GridProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, align, justify, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridVariants({ cols, gap, align, justify, className }))}
        {...props}
      />
    )
  }
)

Grid.displayName = 'Grid'

// GridItem component for granular control
const gridItemVariants = cva(
  '',
  {
    variants: {
      colSpan: {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
        full: 'col-span-full',
      },
      colSpanSm: {
        1: 'sm:col-span-1',
        2: 'sm:col-span-2',
        3: 'sm:col-span-3',
        4: 'sm:col-span-4',
        5: 'sm:col-span-5',
        6: 'sm:col-span-6',
        7: 'sm:col-span-7',
        8: 'sm:col-span-8',
        9: 'sm:col-span-9',
        10: 'sm:col-span-10',
        11: 'sm:col-span-11',
        12: 'sm:col-span-12',
        full: 'sm:col-span-full',
      },
      colSpanMd: {
        1: 'md:col-span-1',
        2: 'md:col-span-2',
        3: 'md:col-span-3',
        4: 'md:col-span-4',
        5: 'md:col-span-5',
        6: 'md:col-span-6',
        7: 'md:col-span-7',
        8: 'md:col-span-8',
        9: 'md:col-span-9',
        10: 'md:col-span-10',
        11: 'md:col-span-11',
        12: 'md:col-span-12',
        full: 'md:col-span-full',
      },
      colSpanLg: {
        1: 'lg:col-span-1',
        2: 'lg:col-span-2',
        3: 'lg:col-span-3',
        4: 'lg:col-span-4',
        5: 'lg:col-span-5',
        6: 'lg:col-span-6',
        7: 'lg:col-span-7',
        8: 'lg:col-span-8',
        9: 'lg:col-span-9',
        10: 'lg:col-span-10',
        11: 'lg:col-span-11',
        12: 'lg:col-span-12',
        full: 'lg:col-span-full',
      },
      colSpanXl: {
        1: 'xl:col-span-1',
        2: 'xl:col-span-2',
        3: 'xl:col-span-3',
        4: 'xl:col-span-4',
        5: 'xl:col-span-5',
        6: 'xl:col-span-6',
        7: 'xl:col-span-7',
        8: 'xl:col-span-8',
        9: 'xl:col-span-9',
        10: 'xl:col-span-10',
        11: 'xl:col-span-11',
        12: 'xl:col-span-12',
        full: 'xl:col-span-full',
      },
      rowSpan: {
        1: 'row-span-1',
        2: 'row-span-2',
        3: 'row-span-3',
        4: 'row-span-4',
        5: 'row-span-5',
        6: 'row-span-6',
        full: 'row-span-full',
      },
    },
    defaultVariants: {
      colSpan: 1,
    }
  }
)

export interface GridItemProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, colSpanSm, colSpanMd, colSpanLg, colSpanXl, rowSpan, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(gridItemVariants({ colSpan, colSpanSm, colSpanMd, colSpanLg, colSpanXl, rowSpan, className }))}
        {...props}
      />
    )
  }
)

GridItem.displayName = 'GridItem'
