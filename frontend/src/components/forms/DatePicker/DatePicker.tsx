'use client'

import { forwardRef } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'
import 'react-datepicker/dist/react-datepicker.css'

// Register Portuguese locale
registerLocale('pt-BR', ptBR)

interface DatePickerProps {
  name: string
  className?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  showTimeSelect?: boolean
  timeIntervals?: number
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
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
            selected={value}
            onChange={onChange}
            locale="pt-BR"
            dateFormat="dd/MM/yyyy"
            placeholderText="Selecione uma data"
            id={name}
            className={clsx(
              'block w-full rounded-md border shadow-sm transition-colors duration-200',
              'focus:outline-none focus:ring-2',
              'disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-400',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'px-3 py-2',
              {
                'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400': !hasError,
                'border-red-300 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400': hasError,
              },
              className
            )}
            calendarClassName="shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            dayClassName={(date) =>
              'hover:bg-blue-100 dark:hover:bg-blue-900 focus:bg-blue-500 focus:text-white rounded-md'
            }
            weekDayClassName={() => 'text-gray-600 dark:text-gray-400 font-medium'}
            monthClassName={() => 'hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md'}
            timeClassName={() => 'hover:bg-blue-100 dark:hover:bg-blue-900 rounded-md'}
          />
        )}
      />
    )
  }
)

DatePicker.displayName = 'DatePicker'
