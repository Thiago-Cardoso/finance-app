// Category types for the Finance App

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  category_type: CategoryType;
  is_default: boolean;
  is_active: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
  usage_stats?: {
    transactions_count: number;
    total_amount_current_month: number;
    can_be_deleted: boolean;
  };
}

export interface CategoryFormData {
  name: string;
  color: string;
  icon: string;
  category_type: CategoryType;
}

export interface CategoryFilters {
  category_type?: CategoryType | 'all';
  search?: string;
  is_default?: boolean;
}

export interface CategoryStatistics {
  summary: {
    total_categories: number;
    active_categories: number;
    categories_with_transactions: number;
    unused_categories: number;
  };
  top_categories: Array<{
    id: number;
    name: string;
    color: string;
    category_type: CategoryType;
    total_amount: number;
    transactions_count: number;
  }>;
  monthly_breakdown: Record<
    string,
    {
      id: number;
      months: Record<string, number>;
    }
  >;
  category_trends: Record<
    string,
    {
      id: number;
      current_amount: number;
      previous_amount: number;
      change_percent: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }
  >;
}

export interface CategoryResponse {
  success: boolean;
  data: Category | Category[];
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: {
      current_page: number;
      total_pages: number;
      total_count: number;
      per_page: number;
    };
  };
}

export interface CategoryStatisticsResponse {
  success: boolean;
  data: CategoryStatistics;
  message?: string;
}
