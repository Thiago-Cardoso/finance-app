---
status: pending
parallelizable: false
blocked_by: ["5.0"]
---

<task_context>
<domain>frontend/ui/components</domain>
<type>refactoring</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>tailwindcss|typescript</dependencies>
<unblocks>7.0</unblocks>
</task_context>

# Tarefa 6.0: Refatorar e Padronizar Componentes UI Base

## Visão Geral

Criar um design system consistente através da refatoração e padronização de todos os componentes UI base, garantindo reutilização, manutenibilidade e consistência visual em toda a aplicação.

## Requisitos

<requirements>
- Criar biblioteca de componentes UI base padronizados
- Implementar variants system consistente
- Garantir tipagem TypeScript rigorosa
- Documentar props e uso de cada componente
- Implementar composição de componentes
- Criar Storybook para documentação (opcional)
- Garantir acessibilidade em todos os componentes
- Implementar testes unitários para componentes críticos
</requirements>

## Subtarefas

### 6.1 Auditoria de Componentes Existentes

- [ ] 6.1.1 Listar todos os componentes UI atuais
- [ ] 6.1.2 Identificar duplicações e inconsistências
- [ ] 6.1.3 Documentar padrões atuais
- [ ] 6.1.4 Definir componentes a serem criados/refatorados

### 6.2 Design Tokens

- [ ] 6.2.1 Definir tokens de cores
- [ ] 6.2.2 Definir tokens de espaçamento
- [ ] 6.2.3 Definir tokens de tipografia
- [ ] 6.2.4 Definir tokens de border-radius, shadows, etc.

### 6.3 Componentes Básicos

- [ ] 6.3.1 Refatorar Button com variants system
- [ ] 6.3.2 Refatorar Input com validação
- [ ] 6.3.3 Criar Select padronizado
- [ ] 6.3.4 Criar Checkbox e Radio
- [ ] 6.3.5 Criar TextArea
- [ ] 6.3.6 Criar Label com required indicator

### 6.4 Componentes de Feedback

- [ ] 6.4.1 Criar Alert (success, error, warning, info)
- [ ] 6.4.2 Criar Toast/Notification system
- [ ] 6.4.3 Refatorar Modal com variants
- [ ] 6.4.4 Criar Drawer padronizado
- [ ] 6.4.5 Criar Tooltip
- [ ] 6.4.6 Criar Progress indicators

### 6.5 Componentes de Navegação

- [ ] 6.5.1 Criar Tabs component
- [ ] 6.5.2 Criar Breadcrumbs
- [ ] 6.5.3 Refatorar Pagination
- [ ] 6.5.4 Criar Dropdown Menu
- [ ] 6.5.5 Criar Command Palette (opcional)

### 6.6 Componentes de Layout

- [ ] 6.6.1 Criar Container component
- [ ] 6.6.2 Criar Stack (vertical/horizontal)
- [ ] 6.6.3 Criar Grid responsive
- [ ] 6.6.4 Criar Card com variants
- [ ] 6.6.5 Criar Divider

### 6.7 Componentes Compostos

- [ ] 6.7.1 Criar Form com validation
- [ ] 6.7.2 Criar Table com sorting e pagination
- [ ] 6.7.3 Criar DatePicker
- [ ] 6.7.4 Criar ColorPicker (para categorias)
- [ ] 6.7.5 Criar FileUpload

### 6.8 Utilitários e Hooks

- [ ] 6.8.1 Criar useDisclosure (modal/drawer)
- [ ] 6.8.2 Criar useClipboard
- [ ] 6.8.3 Criar useToast
- [ ] 6.8.4 Criar useForm validation

### 6.9 Documentação

- [ ] 6.9.1 Documentar cada componente (JSDoc)
- [ ] 6.9.2 Criar README para design system
- [ ] 6.9.3 Criar guia de uso
- [ ] 6.9.4 Setup Storybook (opcional)

## Detalhes de Implementação

### Design Tokens

```typescript
// lib/design-tokens.ts
export const tokens = {
  colors: {
    brand: {
      primary: {
        light: '#2563eb',
        dark: '#3b82f6',
      },
      secondary: {
        light: '#7c3aed',
        dark: '#8b5cf6',
      }
    },
    semantic: {
      success: {
        50: '#f0fdf4',
        500: '#10b981',
        900: '#064e3b',
      },
      error: {
        50: '#fef2f2',
        500: '#ef4444',
        900: '#7f1d1d',
      },
      warning: {
        50: '#fffbeb',
        500: '#f59e0b',
        900: '#78350f',
      },
      info: {
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  },
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
  },
  typography: {
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  }
}
```

### Button Component Refatorado

```tsx
// components/ui/Button/Button.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg',
        secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
        success: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
        ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
        link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, className })}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Input Component Refatorado

```tsx
// components/ui/Input/Input.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, Check } from 'lucide-react'

const inputVariants = cva(
  'w-full rounded-lg border bg-white dark:bg-gray-800 transition-colors focus:outline-none focus:ring-2',
  {
    variants: {
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-5 text-lg',
      },
      state: {
        default: 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500',
        error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    }
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, state, label, error, success, helperText, leftIcon, rightIcon, required, ...props }, ref) => {
    const inputState = error ? 'error' : success ? 'success' : 'default'

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={inputVariants({
              size,
              state: inputState,
              className: `${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`
            })}
            {...props}
          />

          {(rightIcon || error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error && <AlertCircle className="w-5 h-5 text-red-500" />}
              {success && <Check className="w-5 h-5 text-green-500" />}
              {!error && !success && rightIcon}
            </div>
          )}
        </div>

        {(error || success || helperText) && (
          <p className={`text-sm ${
            error ? 'text-red-600 dark:text-red-400' :
            success ? 'text-green-600 dark:text-green-400' :
            'text-gray-500 dark:text-gray-400'
          }`}>
            {error || success || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

### Card Component

```tsx
// components/ui/Card/Card.tsx
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-lg',
        outlined: 'border-2',
        ghost: 'border-0',
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
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, hoverable, className })}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

// Subcomponentes
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`border-b border-gray-200 dark:border-gray-700 pb-4 ${className}`}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-bold text-gray-900 dark:text-gray-100 ${className}`}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`pt-4 ${className}`}
      {...props}
    />
  )
)
CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`border-t border-gray-200 dark:border-gray-700 pt-4 ${className}`}
      {...props}
    />
  )
)
CardFooter.displayName = 'CardFooter'
```

### Alert Component

```tsx
// components/ui/Alert/Alert.tsx
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

const alertVariants = cva(
  'rounded-lg p-4 flex items-start gap-3',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800',
        success: 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 border border-yellow-200 dark:border-yellow-800',
        error: 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800',
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

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  onClose?: () => void
}

export function Alert({ className, variant = 'info', title, children, onClose, ...props }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div className={alertVariants({ variant, className })} role="alert" {...props}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
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
```

### Toast System

```tsx
// contexts/ToastContext.tsx
import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Alert } from '@/components/ui/Alert'

interface Toast {
  id: string
  variant: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 5000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Alert
                variant={toast.variant}
                title={toast.title}
                onClose={() => removeToast(toast.id)}
              >
                {toast.message}
              </Alert>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
```

## Estrutura de Pastas

```
components/ui/
├── Alert/
│   ├── Alert.tsx
│   ├── Alert.test.tsx
│   └── index.ts
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.test.tsx
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.test.tsx
│   └── index.ts
├── Modal/
│   ├── Modal.tsx
│   ├── SimpleModal.tsx
│   ├── Modal.test.tsx
│   └── index.ts
└── index.ts (barrel export)
```

## Critérios de Sucesso

- [ ] Todos os componentes base estão padronizados
- [ ] Variants system implementado com CVA
- [ ] Tipagem TypeScript completa
- [ ] Componentes são acessíveis (ARIA)
- [ ] Documentação clara para cada componente
- [ ] Testes unitários para componentes críticos
- [ ] Design tokens definidos e usados
- [ ] Dark mode funciona em todos os componentes
- [ ] Componentes são responsivos
- [ ] Performance: Re-renders otimizados

## Estimativa de Complexidade

- **Complexidade**: Média
- **Tempo Estimado**: 10-12 horas
- **Risco**: Médio (refatoração extensiva)
- **Dependências**: 5.0 (dark mode validado)

## Próximos Passos

Após completar esta tarefa, desbloqueia:
- **7.0**: Implementar Sistema de Grid Responsivo Consistente
