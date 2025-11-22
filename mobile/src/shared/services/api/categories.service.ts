/**
 * Service: Categories
 *
 * API service for category management.
 */

import { apiClient } from './client';
import type {
  Category,
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryData,
  UpdateCategoryData,
  CategoryStatistics,
  CategoryStatisticsResponse,
} from '@/shared/models/Category.model';

const ENDPOINT = '/api/v1/categories';

/**
 * Get all categories for the authenticated user
 */
export async function getCategories(type?: 'income' | 'expense' | 'both'): Promise<Category[]> {
  const params = type ? { category_type: type } : {};
  const response = await apiClient.get<CategoriesResponse>(ENDPOINT, { params });
  return response.data.data;
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: string): Promise<Category> {
  const response = await apiClient.get<CategoryResponse>(`${ENDPOINT}/${id}`);
  return response.data.data;
}

/**
 * Create a new category
 */
export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const response = await apiClient.post<CategoryResponse>(ENDPOINT, { category: data });
  return response.data.data;
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
  const response = await apiClient.patch<CategoryResponse>(`${ENDPOINT}/${id}`, { category: data });
  return response.data.data;
}

/**
 * Delete a category
 * Note: Will fail if the category has associated transactions
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`${ENDPOINT}/${id}`);
}

/**
 * Get statistics for categories
 */
export async function getCategoryStatistics(
  startDate?: string,
  endDate?: string
): Promise<CategoryStatistics[]> {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;

  const response = await apiClient.get<CategoryStatisticsResponse>(
    `${ENDPOINT}/statistics`,
    { params }
  );
  return response.data.data;
}

/**
 * Seed default categories for new users
 * This is typically called by the backend automatically
 */
export async function seedDefaultCategories(): Promise<Category[]> {
  const response = await apiClient.post<CategoriesResponse>(`${ENDPOINT}/seed`);
  return response.data.data;
}

export const categoriesService = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStatistics,
  seedDefaultCategories,
};

export default categoriesService;
