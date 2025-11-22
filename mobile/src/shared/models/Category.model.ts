/**
 * Model: Category
 *
 * Define a estrutura de dados das categorias de transações.
 * Corresponde ao CategorySerializer do Rails backend.
 */

export type CategoryType = 'income' | 'expense' | 'both';

export interface CategoryUsageStats {
  transactions_count: number;
  total_amount_current_month: number;
  can_be_deleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  category_type: CategoryType;
  is_default: boolean;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  usage_stats?: CategoryUsageStats;
}

export interface CreateCategoryData {
  name: string;
  icon: string;
  color: string;
  category_type: CategoryType;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
  category_type?: CategoryType;
}

export interface CategoryStatistics {
  category_id: string;
  total_transactions: number;
  total_amount: number;
  average_amount: number;
  percentage_of_total: number;
}

export interface PaginationMeta {
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_pages: number;
  total_count: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  meta?: {
    pagination: PaginationMeta;
  };
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

export interface CategoryStatisticsResponse {
  success: boolean;
  data: CategoryStatistics[];
  message?: string;
}
