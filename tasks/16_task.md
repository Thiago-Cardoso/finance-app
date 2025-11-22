---
status: pending
parallelizable: false
blocked_by: ["3.0", "8.0"]
---

<task_context>
<domain>frontend/components</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>frontend_setup, testing</dependencies>
<unblocks>"10.0", "14.0", "17.0"</unblocks>
</task_context>

# Tarefa 16.0: Componentes de Formulários e Validação

## Visão Geral
Desenvolver sistema completo de componentes de formulários reutilizáveis com validação robusta usando React Hook Form e Zod, incluindo inputs, selects, datepickers e validação em tempo real.

## Requisitos
- Componentes de formulário reutilizáveis e acessíveis
- Validação com Zod schemas
- React Hook Form para gerenciamento de estado
- Feedback visual de validação em tempo real
- Suporte a diferentes tipos de input
- Datepicker personalizado
- Select com busca e múltipla seleção
- Máscaras de input para valores monetários
- Formulários compostos e wizards
- Design system consistente

## Subtarefas
- [ ] 16.1 Setup React Hook Form e Zod
- [ ] 16.2 Componente base Form e FormField
- [ ] 16.3 Input de texto com validação
- [ ] 16.4 Input monetário com máscara
- [ ] 16.5 Select customizado com busca
- [ ] 16.6 Datepicker responsivo
- [ ] 16.7 Textarea e inputs especiais
- [ ] 16.8 Sistema de validação unificado
- [ ] 16.9 Formulários compostos
- [ ] 16.10 Testes de componentes e validação

## Sequenciamento
- Bloqueado por: 3.0 (Frontend Setup), 8.0 (Testes Frontend)
- Desbloqueia: 10.0 (Interface Transações), 14.0 (Dashboard), 17.0 (Orçamentos)
- Paralelizável: Não (dependente da estrutura de componentes)

## Detalhes de Implementação

### 1. Dependências e Setup
```json
// package.json additions
{
  "dependencies": {
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "react-datepicker": "^4.21.0",
    "react-select": "^5.8.0",
    "react-input-mask": "^2.0.4",
    "currency.js": "^2.0.4"
  }
}
```

### 2. Schemas de Validação
```ts
// src/lib/validations/schemas.ts
import { z } from 'zod'

// Base schemas
export const requiredStringSchema = z.string().min(1, 'Campo obrigatório')
export const emailSchema = z.string().email('Email inválido')
export const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')

// Financial schemas
export const amountSchema = z
  .number({ invalid_type_error: 'Valor deve ser um número' })
  .positive('Valor deve ser positivo')
  .max(999999.99, 'Valor máximo é R$ 999.999,99')

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string()
})

// Transaction schemas
export const transactionFormSchema = z.object({
  description: z
    .string()
    .min(2, 'Descrição deve ter pelo menos 2 caracteres')
    .max(100, 'Descrição não pode ter mais de 100 caracteres'),
  amount: amountSchema,
  transaction_type: z.enum(['income', 'expense'], {
    required_error: 'Tipo de transação é obrigatório'
  }),
  category_id: z.number().optional(),
  date: z.date({
    required_error: 'Data é obrigatória',
    invalid_type_error: 'Data inválida'
  }),
  notes: z.string().max(500, 'Notas não podem ter mais de 500 caracteres').optional()
})

export type TransactionFormData = z.infer<typeof transactionFormSchema>

// Category schemas
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal'),
  description: z.string().max(200, 'Descrição não pode ter mais de 200 caracteres').optional()
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

// Auth schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: requiredStringSchema
})

export const registerFormSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome não pode ter mais de 50 caracteres'),
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: passwordSchema
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Senhas não coincidem',
  path: ['password_confirmation']
})

export type LoginFormData = z.infer<typeof loginFormSchema>
export type RegisterFormData = z.infer<typeof registerFormSchema>

// Filter schemas
export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  category_id: z.number().optional(),
  transaction_type: z.enum(['income', 'expense']).optional(),
  date_filter: z.enum(['this_month', 'last_month', 'this_year', 'custom']).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional()
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return data.start_date <= data.end_date
  }
  return true
}, {
  message: 'Data inicial deve ser anterior à data final',
  path: ['end_date']
}).refine((data) => {
  if (data.min_amount && data.max_amount) {
    return data.min_amount <= data.max_amount
  }
  return true
}, {
  message: 'Valor mínimo deve ser menor que o valor máximo',
  path: ['max_amount']
})

export type TransactionFilterData = z.infer<typeof transactionFilterSchema>
```

### 3. Componente Base Form
```tsx
// src/components/forms/Form/Form.tsx
'use client'

import { ReactNode } from 'react'
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form'

interface FormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>
  onSubmit: (data: TFieldValues) => void | Promise<void>
  children: ReactNode
  className?: string
  disabled?: boolean
  noValidate?: boolean
}

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className = '',
  disabled = false,
  noValidate = true
}: FormProps<TFieldValues>) {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        noValidate={noValidate}
      >
        <fieldset disabled={disabled} className="disabled:opacity-60">
          {children}
        </fieldset>
      </form>
    </FormProvider>
  )
}
```

### 4. Componente FormField
```tsx
// src/components/forms/FormField/FormField.tsx
'use client'

import { ReactNode } from 'react'
import { useFormContext, get } from 'react-hook-form'
import { clsx } from 'clsx'

interface FormFieldProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  name,
  label,
  description,
  required = false,
  children,
  className = ''
}: FormFieldProps) {
  const {
    formState: { errors }
  } = useFormContext()

  const error = get(errors, name)
  const errorMessage = error?.message as string

  return (
    <div className={clsx('form-field', className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}

      <div className="form-field-input">
        {children}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 mt-1" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
```

### 5. Input de Texto
```tsx
// src/components/forms/Input/Input.tsx
'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import { clsx } from 'clsx'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  name: string
  variant?: 'default' | 'error'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ name, variant = 'default', className, ...props }, ref) => {
    const {
      register,
      formState: { errors }
    } = useFormContext()

    const hasError = !!errors[name]
    const finalVariant = hasError ? 'error' : variant

    return (
      <input
        {...register(name)}
        {...props}
        ref={ref}
        className={clsx(
          'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200',
          'focus:border-primary-500 focus:ring-primary-500 focus:ring-1',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
          {
            'border-gray-300 focus:border-primary-500 focus:ring-primary-500': finalVariant === 'default',
            'border-red-300 focus:border-red-500 focus:ring-red-500': finalVariant === 'error',
          },
          className
        )}
      />
    )
  }
)

Input.displayName = 'Input'
```

### 6. Input Monetário
```tsx
// src/components/forms/MoneyInput/MoneyInput.tsx
'use client'

import { forwardRef, useState } from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import Currency from 'currency.js'
import { clsx } from 'clsx'

interface MoneyInputProps {
  name: string
  placeholder?: string
  className?: string
  disabled?: boolean
  currency?: string
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ name, placeholder = '0,00', className, disabled = false, currency = 'BRL' }, ref) => {
    const { control, formState: { errors } } = useFormContext()
    const [displayValue, setDisplayValue] = useState('')

    const hasError = !!errors[name]

    const formatCurrency = (value: number) => {
      return new Currency(value, {
        symbol: 'R$ ',
        decimal: ',',
        separator: '.',
        precision: 2
      }).format()
    }

    const parseCurrency = (value: string) => {
      const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.')
      return cleanValue ? parseFloat(cleanValue) : 0
    }

    const handleInputChange = (value: string, onChange: (value: number) => void) => {
      const numericValue = parseCurrency(value)
      setDisplayValue(formatCurrency(numericValue))
      onChange(numericValue)
    }

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="relative">
            <input
              ref={ref}
              type="text"
              value={displayValue || formatCurrency(value || 0)}
              onChange={(e) => handleInputChange(e.target.value, onChange)}
              placeholder={placeholder}
              disabled={disabled}
              className={clsx(
                'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200',
                'focus:border-primary-500 focus:ring-primary-500 focus:ring-1',
                'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                'pl-8',
                {
                  'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !hasError,
                  'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
                },
                className
              )}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">R$</span>
            </div>
          </div>
        )}
      />
    )
  }
)

MoneyInput.displayName = 'MoneyInput'
```

### 7. Select Customizado
```tsx
// src/components/forms/Select/Select.tsx
'use client'

import { Controller, useFormContext } from 'react-hook-form'
import ReactSelect, { Props as ReactSelectProps } from 'react-select'
import { clsx } from 'clsx'

interface SelectOption {
  value: string | number
  label: string
  color?: string
}

interface SelectProps extends Omit<ReactSelectProps<SelectOption>, 'name'> {
  name: string
  options: SelectOption[]
  placeholder?: string
  isSearchable?: boolean
  isClearable?: boolean
  isMulti?: boolean
  className?: string
}

export function Select({
  name,
  options,
  placeholder = 'Selecione...',
  isSearchable = true,
  isClearable = true,
  isMulti = false,
  className,
  ...props
}: SelectProps) {
  const { control, formState: { errors } } = useFormContext()
  const hasError = !!errors[name]

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderColor: hasError
        ? '#ef4444'
        : state.isFocused
          ? '#3b82f6'
          : '#d1d5db',
      boxShadow: state.isFocused
        ? hasError
          ? '0 0 0 1px #ef4444'
          : '0 0 0 1px #3b82f6'
        : 'none',
      '&:hover': {
        borderColor: hasError ? '#ef4444' : '#3b82f6'
      }
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3b82f6'
        : state.isFocused
          ? '#eff6ff'
          : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
      }
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#eff6ff',
      color: '#1e40af'
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#1e40af'
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#1e40af',
      '&:hover': {
        backgroundColor: '#3b82f6',
        color: 'white'
      }
    })
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, onBlur } }) => (
        <ReactSelect
          {...props}
          options={options}
          value={options.find(option => option.value === value) || null}
          onChange={(selectedOption: any) => {
            if (isMulti) {
              onChange(selectedOption?.map((option: SelectOption) => option.value) || [])
            } else {
              onChange(selectedOption?.value || null)
            }
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          isSearchable={isSearchable}
          isClearable={isClearable}
          isMulti={isMulti}
          styles={customStyles}
          className={clsx('react-select-container', className)}
          classNamePrefix="react-select"
          noOptionsMessage={() => 'Nenhuma opção encontrada'}
          loadingMessage={() => 'Carregando...'}
        />
      )}
    />
  )
}
```

### 8. Datepicker
```tsx
// src/components/forms/DatePicker/DatePicker.tsx
'use client'

import { forwardRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerProps extends Omit<ReactDatePickerProps, 'name' | 'onChange' | 'selected'> {
  name: string
  className?: string
}

export const DatePicker = forwardRef<ReactDatePicker, DatePickerProps>(
  ({ name, className, ...props }, ref) => {
    const { control, formState: { errors } } = useFormContext()
    const hasError = !!errors[name]

    return (
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <ReactDatePicker
            {...props}
            ref={ref}
            selected={value}
            onChange={onChange}
            locale={ptBR}
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione uma data"
            className={clsx(
              'block w-full rounded-md border-gray-300 shadow-sm transition-colors duration-200',
              'focus:border-primary-500 focus:ring-primary-500 focus:ring-1',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              {
                'border-gray-300 focus:border-primary-500 focus:ring-primary-500': !hasError,
                'border-red-300 focus:border-red-500 focus:ring-red-500': hasError,
              },
              className
            )}
            calendarClassName="shadow-lg border border-gray-200 rounded-lg"
            dayClassName={(date) =>
              'hover:bg-primary-100 focus:bg-primary-500 focus:text-white rounded-md'
            }
            weekDayClassName={() => 'text-gray-600 font-medium'}
            monthClassName={() => 'hover:bg-primary-100 rounded-md'}
            timeClassName={() => 'hover:bg-primary-100 rounded-md'}
          />
        )}
      />
    )
  }
)

DatePicker.displayName = 'DatePicker'
```

### 9. Formulário de Transação Completo
```tsx
// src/components/forms/TransactionForm/TransactionForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '../Form/Form'
import { FormField } from '../FormField/FormField'
import { Input } from '../Input/Input'
import { MoneyInput } from '../MoneyInput/MoneyInput'
import { Select } from '../Select/Select'
import { DatePicker } from '../DatePicker/DatePicker'
import { Button } from '@/components/ui/Button/Button'
import { transactionFormSchema, TransactionFormData } from '@/lib/validations/schemas'

interface TransactionFormProps {
  initialData?: Partial<TransactionFormData>
  categories: Array<{ id: number; name: string; color: string }>
  onSubmit: (data: TransactionFormData) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
}

export function TransactionForm({
  initialData,
  categories,
  onSubmit,
  loading = false,
  submitLabel = 'Salvar Transação'
}: TransactionFormProps) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: '',
      amount: 0,
      transaction_type: 'expense',
      date: new Date(),
      notes: '',
      ...initialData
    }
  })

  const transactionTypeOptions = [
    { value: 'income', label: 'Receita' },
    { value: 'expense', label: 'Despesa' }
  ]

  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name,
    color: category.color
  }))

  const watchedType = form.watch('transaction_type')

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <FormField name="description" label="Descrição" required>
        <Input
          name="description"
          placeholder="Ex: Supermercado, Salário, Aluguel..."
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField name="amount" label="Valor" required>
          <MoneyInput name="amount" />
        </FormField>

        <FormField name="date" label="Data" required>
          <DatePicker name="date" />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField name="transaction_type" label="Tipo" required>
          <Select
            name="transaction_type"
            options={transactionTypeOptions}
            isClearable={false}
            isSearchable={false}
          />
        </FormField>

        {watchedType === 'expense' && (
          <FormField name="category_id" label="Categoria">
            <Select
              name="category_id"
              options={categoryOptions}
              placeholder="Selecione uma categoria"
            />
          </FormField>
        )}
      </div>

      <FormField name="notes" label="Observações">
        <textarea
          {...form.register('notes')}
          rows={3}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          placeholder="Observações adicionais (opcional)"
        />
      </FormField>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => form.reset()}
        >
          Limpar
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {submitLabel}
        </Button>
      </div>
    </Form>
  )
}
```

### 10. Testes dos Componentes
```tsx
// src/components/forms/TransactionForm/TransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { TransactionForm } from './TransactionForm'

const mockCategories = [
  { id: 1, name: 'Alimentação', color: '#ef4444' },
  { id: 2, name: 'Transporte', color: '#3b82f6' }
]

const defaultProps = {
  categories: mockCategories,
  onSubmit: jest.fn()
}

describe('TransactionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all form fields', () => {
    render(<TransactionForm {...defaultProps} />)

    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/observações/i)).toBeInTheDocument()
  })

  it('shows category field only for expenses', async () => {
    render(<TransactionForm {...defaultProps} />)

    // Initially should show category (default is expense)
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()

    // Change to income
    const typeSelect = screen.getByLabelText(/tipo/i)
    fireEvent.change(typeSelect, { target: { value: 'income' } })

    await waitFor(() => {
      expect(screen.queryByLabelText(/categoria/i)).not.toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(<TransactionForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /salvar transação/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/descrição deve ter pelo menos/i)).toBeInTheDocument()
    })

    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    render(<TransactionForm {...defaultProps} />)

    // Fill form
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Supermercado' }
    })

    fireEvent.change(screen.getByLabelText(/valor/i), {
      target: { value: '100,00' }
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /salvar transação/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Supermercado',
          amount: 100,
          transaction_type: 'expense'
        })
      )
    })
  })

  it('clears form when clear button is clicked', async () => {
    render(<TransactionForm {...defaultProps} />)

    // Fill description
    const descriptionInput = screen.getByLabelText(/descrição/i)
    fireEvent.change(descriptionInput, { target: { value: 'Test' } })

    // Click clear
    const clearButton = screen.getByRole('button', { name: /limpar/i })
    fireEvent.click(clearButton)

    await waitFor(() => {
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('populates form with initial data', () => {
    const initialData = {
      description: 'Initial description',
      amount: 150,
      transaction_type: 'income' as const
    }

    render(
      <TransactionForm
        {...defaultProps}
        initialData={initialData}
      />
    )

    expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument()
    expect(screen.getByDisplayValue('R$ 150,00')).toBeInTheDocument()
  })
})
```

## Critérios de Sucesso
- [ ] React Hook Form e Zod configurados
- [ ] Componentes de formulário reutilizáveis
- [ ] Validação em tempo real funcionando
- [ ] Input monetário com máscara
- [ ] Select customizado com busca
- [ ] Datepicker responsivo
- [ ] Schemas de validação robustos
- [ ] Formulários compostos implementados
- [ ] Acessibilidade garantida
- [ ] Testes unitários com cobertura 90%+

## Acessibilidade
- Labels associados corretamente aos inputs
- Mensagens de erro anunciadas por screen readers
- Navegação por teclado funcional
- Estados de foco visíveis
- Atributos ARIA apropriados

## Recursos Necessários
- Desenvolvedor frontend React experiente
- Designer UX para validação de usabilidade
- Tester para acessibilidade

## Tempo Estimado
- Setup e configuração: 4-5 horas
- Componentes base (Form, FormField): 6-8 horas
- Inputs especializados: 8-10 horas
- Validação e schemas: 6-8 horas
- Formulários compostos: 6-8 horas
- Testes e acessibilidade: 8-10 horas
- **Total**: 5-6 dias de trabalho