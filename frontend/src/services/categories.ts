import { apiClient as api } from '@/lib/api'
import {
  Category,
  CategoryFormData,
  CategoryFilters,
  CategoryResponse,
  CategoryStatisticsResponse,
  TransactionResponse,
} from '@/types/category'

export const categoriesService = {
  // Get all categories with optional filters
  async getAll(filters?: CategoryFilters): Promise<CategoryResponse> {
    const params = new URLSearchParams()

    if (filters?.category_type && filters.category_type !== 'all') {
      params.append('category_type', filters.category_type)
    }
    if (filters?.search) {
      params.append('search', filters.search)
    }
    if (filters?.is_default !== undefined) {
      params.append('is_default', filters.is_default.toString())
    }

    const queryString = params.toString()
    const url = `/categories${queryString ? `?${queryString}` : ''}`

    return api.get<CategoryResponse>(url)
  },

  // Get single category by ID
  async getById(id: number): Promise<CategoryResponse> {
    return api.get<CategoryResponse>(`/categories/${id}`)
  },

  // Create new category
  async create(data: CategoryFormData): Promise<CategoryResponse> {
    return api.post<CategoryResponse>('/categories', {
      category: data,
    })
  },

  // Update category
  async update(
    id: number,
    data: Partial<CategoryFormData>
  ): Promise<CategoryResponse> {
    return api.put<CategoryResponse>(`/categories/${id}`, {
      category: data,
    })
  },

  // Delete category
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(
      `/categories/${id}`
    )
  },

  // Get transactions for a category
  async getTransactions(
    id: number,
    page = 1,
    per_page = 10
  ): Promise<TransactionResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
    })

    return api.get<TransactionResponse>(
      `/categories/${id}/transactions?${params.toString()}`
    )
  },

  // Get category statistics
  async getStatistics(
    start_date?: string,
    end_date?: string
  ): Promise<CategoryStatisticsResponse> {
    const params = new URLSearchParams()

    if (start_date) params.append('start_date', start_date)
    if (end_date) params.append('end_date', end_date)

    const queryString = params.toString()
    const url = `/categories/statistics${queryString ? `?${queryString}` : ''}`

    return api.get<CategoryStatisticsResponse>(url)
  },
}
