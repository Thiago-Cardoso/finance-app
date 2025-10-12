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
