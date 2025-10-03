'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category, CategoryFormData } from '@/types/category'
import { Input } from '@/components/ui/Input/Input'
import { Button } from '@/components/ui/Button/Button'
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'

const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color (e.g., #ff0000)'),
  icon: z
    .string()
    .min(1, 'Icon is required')
    .max(2, 'Icon must be at most 2 characters'),
  category_type: z.enum(['income', 'expense'], {
    required_error: 'Category type is required',
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
        label="Category Name"
        placeholder="e.g., Groceries, Salary"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Category Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="category_type"
          control={control}
          render={({ field }) => (
            <RadioGroup
              name="category_type"
              options={[
                { value: 'income', label: 'Income', color: 'text-green-600' },
                { value: 'expense', label: 'Expense', color: 'text-red-600' },
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
          Color <span className="text-red-500">*</span>
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
          Icon <span className="text-red-500">*</span>
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
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {category ? 'Update Category' : 'Create Category'}
        </Button>
      </div>
    </form>
  )
}
