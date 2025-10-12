'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { useFormContext } from 'react-hook-form'
import { clsx } from 'clsx'

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: string
  variant?: 'default' | 'error'
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ name, variant = 'default', className, ...props }, ref) => {
    const {
      register,
      formState: { errors }
    } = useFormContext()

    const hasError = !!errors[name]
    const finalVariant = hasError ? 'error' : variant

    return (
      <textarea
        {...register(name)}
        {...props}
        ref={ref}
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
            'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400': finalVariant === 'default',
            'border-red-300 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500 dark:focus:ring-red-400': finalVariant === 'error',
          },
          className
        )}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
