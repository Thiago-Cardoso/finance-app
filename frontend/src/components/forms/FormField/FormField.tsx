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
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}

      <div className="form-field-input">
        {children}
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
