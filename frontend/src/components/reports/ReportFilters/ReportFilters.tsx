'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from '@/components/forms/FormField/FormField'
import { DatePicker } from '@/components/forms/DatePicker/DatePicker'
import { Select, SelectOption } from '@/components/forms/Select/Select'
import { MoneyInput } from '@/components/forms/MoneyInput/MoneyInput'
import { Button } from '@/components/ui/Button/Button'
import { useCategories } from '@/hooks/useCategories'
import { AnalyticsFilters } from '@/types/analytics'
import { useLocale } from '@/contexts/LocaleContext'
import { clsx } from 'clsx'

const createFiltersSchema = (t: (key: string) => string) => z.object({
  period_preset: z.enum(['this_month', 'last_month', 'this_quarter', 'last_quarter', 'this_year', 'last_year', 'custom']).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  category_ids: z.array(z.number()).optional(),
  transaction_type: z.enum(['income', 'expense']).optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return data.start_date <= data.end_date
  }
  return true
}, {
  message: t('validation.startDateBeforeEndDate'),
  path: ['end_date']
}).refine((data) => {
  if (data.min_amount && data.max_amount) {
    return data.min_amount <= data.max_amount
  }
  return true
}, {
  message: t('validation.minAmountLessThanMax'),
  path: ['max_amount']
})

type FiltersFormData = z.infer<ReturnType<typeof createFiltersSchema>>

interface ReportFiltersProps {
  initialFilters?: AnalyticsFilters
  onFiltersChange: (filters: AnalyticsFilters) => void
  loading?: boolean
  showAdvanced?: boolean
  className?: string
}

export function ReportFilters({
  initialFilters = {},
  onFiltersChange,
  loading = false,
  showAdvanced = true,
  className
}: ReportFiltersProps) {
  const { t } = useLocale()
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { data: categoriesData } = useCategories(undefined, 1, 100) // Fetch all categories (up to 100)

  const form = useForm<FiltersFormData>({
    resolver: zodResolver(createFiltersSchema(t)),
    defaultValues: {
      period_preset: 'this_month',
      start_date: initialFilters.start_date ? new Date(initialFilters.start_date) : undefined,
      end_date: initialFilters.end_date ? new Date(initialFilters.end_date) : undefined,
      category_ids: initialFilters.category_ids || [],
      transaction_type: initialFilters.transaction_type,
      min_amount: initialFilters.min_amount,
      max_amount: initialFilters.max_amount,
    }
  })

  // Set mounted flag after initial render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const categories = Array.isArray(categoriesData?.data) ? categoriesData.data : []
  const categoryOptions: SelectOption[] = categories.map(category => ({
    value: category.id,
    label: category.name,
    color: category.color
  }))

  const periodPresetOptions: SelectOption[] = [
    { value: 'this_month', label: t('reports.filters.presets.thisMonth') },
    { value: 'last_month', label: t('reports.filters.presets.lastMonth') },
    { value: 'this_quarter', label: t('reports.filters.presets.thisQuarter') },
    { value: 'last_quarter', label: t('reports.filters.presets.lastQuarter') },
    { value: 'this_year', label: t('reports.filters.presets.thisYear') },
    { value: 'last_year', label: t('reports.filters.presets.lastYear') },
    { value: 'custom', label: t('reports.filters.presets.custom') }
  ]

  const transactionTypeOptions: SelectOption[] = [
    { value: 'income', label: t('transactions.types.income') },
    { value: 'expense', label: t('transactions.types.expense') }
  ]

  const handlePeriodPresetChange = (preset: string) => {
    if (preset === 'custom') {
      return
    }

    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (preset) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        break
      case 'last_quarter':
        const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3
        startDate = new Date(now.getFullYear(), lastQuarterStart, 1)
        endDate = new Date(now.getFullYear(), lastQuarterStart + 3, 0)
        break
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        return
    }

    form.setValue('start_date', startDate)
    form.setValue('end_date', endDate)
  }

  // Watch for period preset changes (only after mount to avoid hydration issues)
  useEffect(() => {
    if (!isMounted) return

    const subscription = form.watch((value, { name }) => {
      if (name === 'period_preset' && value.period_preset) {
        handlePeriodPresetChange(value.period_preset)
      }
    })
    return () => subscription.unsubscribe()
  }, [isMounted])

  const onSubmit = (data: FiltersFormData) => {
    const filters: AnalyticsFilters = {
      start_date: data.start_date?.toISOString().split('T')[0],
      end_date: data.end_date?.toISOString().split('T')[0],
      category_ids: data.category_ids?.length ? data.category_ids : undefined,
      transaction_type: data.transaction_type,
      min_amount: data.min_amount,
      max_amount: data.max_amount
    }

    onFiltersChange(filters)
  }

  const handleClearFilters = () => {
    form.reset({
      period_preset: 'this_month',
      start_date: undefined,
      end_date: undefined,
      category_ids: [],
      transaction_type: undefined,
      min_amount: undefined,
      max_amount: undefined,
    })
    onFiltersChange({})
  }

  return (
    <div className={clsx(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('reports.filters.title')}</h3>
        {showAdvanced && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            type="button"
          >
            {isAdvancedOpen ? t('reports.filters.hideAdvanced') : t('reports.filters.showAdvanced')}
          </Button>
        )}
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Period Preset */}
          <FormField name="period_preset" label={t('reports.filters.periodPreset')}>
            <Select
              name="period_preset"
              options={periodPresetOptions}
              isClearable={false}
              isSearchable={false}
            />
          </FormField>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField name="start_date" label={t('reports.filters.startDate')}>
              <DatePicker name="start_date" />
            </FormField>

            <FormField name="end_date" label={t('reports.filters.endDate')}>
              <DatePicker name="end_date" />
            </FormField>
          </div>

          {/* Advanced Filters */}
          {isAdvancedOpen && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="transaction_type" label={t('reports.filters.transactionType')}>
                  <Select
                    name="transaction_type"
                    options={transactionTypeOptions}
                    placeholder={t('reports.filters.allTypes')}
                  />
                </FormField>

                <FormField name="category_ids" label={t('reports.filters.categories')}>
                  <Select
                    name="category_ids"
                    options={categoryOptions}
                    placeholder={t('reports.filters.allCategories')}
                    isMulti
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="min_amount" label={t('reports.filters.minAmount')}>
                  <MoneyInput name="min_amount" placeholder="0,00" />
                </FormField>

                <FormField name="max_amount" label={t('reports.filters.maxAmount')}>
                  <MoneyInput name="max_amount" placeholder="0,00" />
                </FormField>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClearFilters}
              disabled={loading}
            >
              {t('reports.filters.clear')}
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {t('reports.filters.apply')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
