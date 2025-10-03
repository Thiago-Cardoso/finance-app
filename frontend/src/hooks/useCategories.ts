import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesService } from '@/services/categories'
import {
  Category,
  CategoryFormData,
  CategoryFilters,
  CategoryStatistics,
} from '@/types/category'
import { toast } from 'react-hot-toast'

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters?: CategoryFilters) =>
    [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
  transactions: (id: number) => [...categoryKeys.all, 'transactions', id] as const,
  statistics: (start_date?: string, end_date?: string) =>
    [...categoryKeys.all, 'statistics', start_date, end_date] as const,
}

// Get all categories
export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: categoryKeys.list(filters),
    queryFn: async () => {
      const response = await categoriesService.getAll(filters)
      return response.data as Category[]
    },
  })
}

// Get single category by ID
export function useCategory(id: number) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      const response = await categoriesService.getById(id)
      return Array.isArray(response.data) ? response.data[0] : response.data
    },
    enabled: !!id,
  })
}

// Get category transactions
export function useCategoryTransactions(
  id: number,
  page = 1,
  per_page = 10
) {
  return useQuery({
    queryKey: [...categoryKeys.transactions(id), page, per_page],
    queryFn: async () => {
      const response = await categoriesService.getTransactions(id, page, per_page)
      return response
    },
    enabled: !!id,
  })
}

// Get category statistics
export function useCategoryStatistics(
  start_date?: string,
  end_date?: string
) {
  return useQuery({
    queryKey: categoryKeys.statistics(start_date, end_date),
    queryFn: async () => {
      const response = await categoriesService.getStatistics(start_date, end_date)
      return response.data
    },
  })
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CategoryFormData) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Category created successfully')
    },
    onError: (error: any) => {
      console.error('Create category error:', error)
      const message = error.message?.includes('401') || error.message?.includes('Unauthorized')
        ? 'Authentication required. Please log in.'
        : error.response?.data?.message || error.message || 'Failed to create category'
      toast.error(message)
    },
  })
}

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CategoryFormData> }) =>
      categoriesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) })
      toast.success('Category updated successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update category'
      toast.error(message)
    },
  })
}

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      toast.success('Category deleted successfully')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete category'
      toast.error(message)
    },
  })
}
