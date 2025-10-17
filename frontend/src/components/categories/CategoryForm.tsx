'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category, CategoryFormData } from '@/types/category'
import { hexColorRegex } from '@/lib/validations'
import { Input } from '@/components/ui/Input/Input'
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'

const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  color: z
    .string()
    .regex(hexColorRegex, 'Deve ser uma cor hexadecimal válida (ex: #ff0000)'),
  icon: z
    .string()
    .min(1, 'Ícone é obrigatório')
    .max(2, 'Ícone deve ter no máximo 2 caracteres'),
  category_type: z.enum(['income', 'expense'], {
    required_error: 'Tipo de categoria é obrigatório',
  }),
})

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: CategoryFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isLoading = false,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          color: category.color,
          icon: category.icon,
          category_type: category.category_type,
        }
      : {
          name: '',
          color: '#3b82f6',
          icon: '💰',
          category_type: 'expense',
        },
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        color: category.color,
        icon: category.icon,
        category_type: category.category_type,
      })
    }
  }, [category, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category Name */}
      <Input
        label="Nome da Categoria"
        placeholder="ex: Mercado, Salário"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Category Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tipo <span className="text-red-500">*</span>
        </label>
        <Controller
          name="category_type"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name="category_type"
              options={[
                { value: 'income', label: 'Receita', color: 'text-green-600' },
                { value: 'expense', label: 'Despesa', color: 'text-red-600' },
              ]}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.category_type && (
          <p className="text-sm text-red-600">{errors.category_type.message}</p>
        )}
      </div>

      {/* Color Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Cor <span className="text-red-500">*</span>
        </label>
        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <ColorPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.color && (
          <p className="text-sm text-red-600">{errors.color.message}</p>
        )}
      </div>

      {/* Icon Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Ícone <span className="text-red-500">*</span>
        </label>
        <Controller
          name="icon"
          control={control}
          render={({ field }) => (
            <IconPicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.icon && (
          <p className="text-sm text-red-600">{errors.icon.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 mt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {category ? 'Atualizar Categoria' : 'Criar Categoria'}
        </button>
      </div>
    </form>
  )
}
