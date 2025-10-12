'use client'

import { forwardRef, useState, useEffect } from 'react'
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
        symbol: '',
        decimal: ',',
        separator: '.',
        precision: 2
      }).format()
    }

    const parseCurrency = (value: string) => {
      // Remove tudo exceto dígitos e vírgula
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
        render={({ field: { onChange, value, onBlur } }) => (
          <div className="relative">
            <input
              ref={ref}
              id={name}
              type="text"
              inputMode="decimal"
              value={displayValue || formatCurrency(value || 0)}
              onChange={(e) => handleInputChange(e.target.value, onChange)}
              onBlur={onBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={clsx(
                'block w-full rounded-md border shadow-sm transition-colors duration-200',
                'focus:outline-none focus:ring-2',
                'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'px-3 py-2 pl-10',
                {
                  'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400': !hasError,
                  'border-red-300 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400': hasError,
                },
                className
              )}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">R$</span>
            </div>
          </div>
        )}
      />
    )
  }
)

MoneyInput.displayName = 'MoneyInput'
