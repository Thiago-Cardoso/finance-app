---
status: pending
parallelizable: false
blocked_by: ["6.0"]
---

<task_context>
<domain>frontend/ui/layout</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>low</complexity>
<dependencies>tailwindcss|responsive</dependencies>
<unblocks>8.0</unblocks>
</task_context>

# Tarefa 7.0: Implementar Sistema de Grid Responsivo Consistente

## Visão Geral

Criar um sistema de grid e layout responsivo consistente que seja utilizado em toda a aplicação, garantindo uniformidade na apresentação de conteúdo e facilitando o desenvolvimento de novas features.

## Requisitos

<requirements>
- Criar componentes de layout reutilizáveis
- Implementar sistema de grid flexível
- Garantir responsividade consistente
- Documentar padrões de layout
- Criar exemplos de uso
- Otimizar para performance
- Garantir acessibilidade
</requirements>

## Subtarefas

### 7.1 Componentes de Layout Base

- [ ] 7.1.1 Criar Container component
- [ ] 7.1.2 Criar Grid component
- [ ] 7.1.3 Criar Stack (Flex) component
- [ ] 7.1.4 Criar Section component

### 7.2 Sistema de Espaçamento

- [ ] 7.2.1 Definir escala de espaçamento padrão
- [ ] 7.2.2 Criar Spacer component
- [ ] 7.2.3 Criar Divider component
- [ ] 7.2.4 Documentar padrões de spacing

### 7.3 Layouts Específicos

- [ ] 7.3.1 Criar PageLayout (header + content + footer)
- [ ] 7.3.2 Criar TwoColumnLayout (sidebar + main)
- [ ] 7.3.3 Criar AuthLayout (centralizado)
- [ ] 7.3.4 Criar DashboardLayout

### 7.4 Breakpoints e Media Queries

- [ ] 7.4.1 Documentar breakpoints padrão
- [ ] 7.4.2 Criar utility hooks (useBreakpoint)
- [ ] 7.4.3 Criar Show/Hide components
- [ ] 7.4.4 Testar em diferentes dispositivos

### 7.5 Aplicação nos Componentes Existentes

- [ ] 7.5.1 Refatorar dashboard para usar novo grid
- [ ] 7.5.2 Refatorar transactions para usar novo grid
- [ ] 7.5.3 Refatorar categories para usar novo grid
- [ ] 7.5.4 Validar consistência visual

### 7.6 Documentação e Exemplos

- [ ] 7.6.1 Criar guia de uso do sistema de grid
- [ ] 7.6.2 Documentar breakpoints e responsividade
- [ ] 7.6.3 Criar exemplos de layouts comuns
- [ ] 7.6.4 Criar storybook stories (opcional)

## Detalhes de Implementação

### Container Component

```tsx
// components/ui/Container/Container.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

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
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, centered, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={containerVariants({ maxWidth, padding, centered, className })}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'
```

### Grid Component

```tsx
// components/ui/Grid/Grid.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

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
        start: 'justify-items-start',
        center: 'justify-items-center',
        end: 'justify-items-end',
        stretch: 'justify-items-stretch',
      }
    },
    defaultVariants: {
      cols: 1,
      gap: 4,
      align: 'stretch',
      justify: 'stretch',
    }
  }
)

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, align, justify, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={gridVariants({ cols, gap, align, justify, className })}
        {...props}
      />
    )
  }
)

Grid.displayName = 'Grid'

// GridItem para controle granular
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12 | 'full'
  rowSpan?: 1 | 2 | 3 | 4 | 6 | 'full'
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, rowSpan, ...props }, ref) => {
    const colSpanClass = colSpan === 'full' ? 'col-span-full' : `col-span-${colSpan}`
    const rowSpanClass = rowSpan === 'full' ? 'row-span-full' : `row-span-${rowSpan}`

    return (
      <div
        ref={ref}
        className={`${colSpan ? colSpanClass : ''} ${rowSpan ? rowSpanClass : ''} ${className}`}
        {...props}
      />
    )
  }
)

GridItem.displayName = 'GridItem'
```

### Stack Component (Flexbox)

```tsx
// components/ui/Stack/Stack.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const stackVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        column: 'flex-col',
        rowReverse: 'flex-row-reverse',
        columnReverse: 'flex-col-reverse',
      },
      spacing: {
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
        baseline: 'items-baseline',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      wrap: {
        true: 'flex-wrap',
        false: 'flex-nowrap',
        reverse: 'flex-wrap-reverse',
      }
    },
    defaultVariants: {
      direction: 'column',
      spacing: 4,
      align: 'stretch',
      justify: 'start',
      wrap: false,
    }
  }
)

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, spacing, align, justify, wrap, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={stackVariants({ direction, spacing, align, justify, wrap, className })}
        {...props}
      />
    )
  }
)

Stack.displayName = 'Stack'

// Aliases
export const VStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="column" {...props} />
)
VStack.displayName = 'VStack'

export const HStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="row" {...props} />
)
HStack.displayName = 'HStack'
```

### PageLayout Component

```tsx
// components/layout/PageLayout.tsx
import { Container } from '@/components/ui/Container'
import { VStack } from '@/components/ui/Stack'

interface PageLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
}

export function PageLayout({ children, header, footer, maxWidth = '7xl' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {header}

      <main className="flex-1 py-8">
        <Container maxWidth={maxWidth}>
          {children}
        </Container>
      </main>

      {footer}
    </div>
  )
}

// PageHeader Component
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
}) {
  return (
    <div className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {breadcrumbs && (
          <div className="mb-4">
            {breadcrumbs}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex gap-3 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

### TwoColumnLayout

```tsx
// components/layout/TwoColumnLayout.tsx
import { Grid, GridItem } from '@/components/ui/Grid'

interface TwoColumnLayoutProps {
  sidebar: React.ReactNode
  main: React.ReactNode
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: 'sm' | 'md' | 'lg'
}

export function TwoColumnLayout({
  sidebar,
  main,
  sidebarPosition = 'left',
  sidebarWidth = 'md'
}: TwoColumnLayoutProps) {
  const sidebarWidthClass = {
    sm: 'lg:col-span-2',
    md: 'lg:col-span-3',
    lg: 'lg:col-span-4',
  }[sidebarWidth]

  const mainWidthClass = {
    sm: 'lg:col-span-10',
    md: 'lg:col-span-9',
    lg: 'lg:col-span-8',
  }[sidebarWidth]

  return (
    <Grid cols={12} gap={6}>
      {sidebarPosition === 'left' ? (
        <>
          <GridItem className={`col-span-full ${sidebarWidthClass}`}>
            <aside>{sidebar}</aside>
          </GridItem>
          <GridItem className={`col-span-full ${mainWidthClass}`}>
            <main>{main}</main>
          </GridItem>
        </>
      ) : (
        <>
          <GridItem className={`col-span-full ${mainWidthClass}`}>
            <main>{main}</main>
          </GridItem>
          <GridItem className={`col-span-full ${sidebarWidthClass}`}>
            <aside>{sidebar}</aside>
          </GridItem>
        </>
      )}
    </Grid>
  )
}
```

### Breakpoint Hooks

```typescript
// hooks/useBreakpoint.ts
import { useState, useEffect } from 'react'

const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const query = `(min-width: ${breakpoints[breakpoint]})`
    const media = window.matchMedia(query)

    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [breakpoint])

  return matches
}

// Specific hooks
export const useIsSmall = () => useBreakpoint('sm')
export const useIsMedium = () => useBreakpoint('md')
export const useIsLarge = () => useBreakpoint('lg')
export const useIsXLarge = () => useBreakpoint('xl')
```

### Show/Hide Components

```tsx
// components/ui/Responsive/Responsive.tsx
import { useBreakpoint } from '@/hooks/useBreakpoint'

interface ShowProps {
  above?: 'sm' | 'md' | 'lg' | 'xl'
  below?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

export function Show({ above, below, children }: ShowProps) {
  const isAbove = above ? useBreakpoint(above) : true
  const isBelow = below ? !useBreakpoint(below) : true

  if (isAbove && isBelow) {
    return <>{children}</>
  }

  return null
}

export function Hide({ above, below, children }: ShowProps) {
  const isAbove = above ? useBreakpoint(above) : false
  const isBelow = below ? !useBreakpoint(below) : false

  if (!isAbove && !isBelow) {
    return <>{children}</>
  }

  return null
}

// Uso:
<Show above="md">
  <DesktopNav />
</Show>

<Hide above="md">
  <MobileNav />
</Hide>
```

### Spacer Component

```tsx
// components/ui/Spacer/Spacer.tsx
interface SpacerProps {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16
  axis?: 'horizontal' | 'vertical'
}

export function Spacer({ size = 4, axis = 'vertical' }: SpacerProps) {
  const sizeClass = `${axis === 'vertical' ? 'h' : 'w'}-${size}`

  return (
    <div
      className={sizeClass}
      aria-hidden="true"
    />
  )
}
```

### Divider Component

```tsx
// components/ui/Divider/Divider.tsx
interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  className?: string
}

export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px bg-gray-200 dark:bg-gray-700 ${className}`}
        role="separator"
        aria-orientation="vertical"
      />
    )
  }

  if (label) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
        </div>
      </div>
    )
  }

  return (
    <hr
      className={`border-gray-200 dark:border-gray-700 ${className}`}
      role="separator"
      aria-orientation="horizontal"
    />
  )
}
```

## Exemplo de Uso: Refatorando Categories Page

```tsx
// app/categories/page.tsx (ANTES)
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    <div className="mb-8">
      {/* Header */}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Categories */}
    </div>
  </div>
</div>

// app/categories/page.tsx (DEPOIS)
<PageLayout>
  <PageHeader
    title="Categories"
    description="Organize your finances with custom categories"
    actions={
      <>
        <Button variant="secondary" onClick={openStats}>
          <BarChart3 /> Statistics
        </Button>
        <Button onClick={handleCreate}>
          <Plus /> New Category
        </Button>
      </>
    }
  />

  <Grid cols={3} gap={6}>
    {categories.map(category => (
      <CategoryCard key={category.id} category={category} />
    ))}
  </Grid>

  {pagination && (
    <Pagination ... />
  )}
</PageLayout>
```

## Critérios de Sucesso

- [ ] Todos os componentes de layout estão implementados
- [ ] Sistema de grid é flexível e fácil de usar
- [ ] Breakpoints são consistentes
- [ ] Documentação está clara
- [ ] Exemplos de uso estão disponíveis
- [ ] Responsividade funciona perfeitamente
- [ ] Performance é ótima (sem re-renders desnecessários)
- [ ] Acessibilidade está garantida
- [ ] Código é type-safe (TypeScript)
- [ ] Todas as páginas principais usam o novo sistema

## Estimativa de Complexidade

- **Complexidade**: Baixa
- **Tempo Estimado**: 4-6 horas
- **Risco**: Baixo (componentes simples)
- **Dependências**: 6.0 (componentes base)

## Próximos Passos

Após completar esta tarefa, desbloqueia:
- **8.0**: Implementar Testes Visuais com Playwright
