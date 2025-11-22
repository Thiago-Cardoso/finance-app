/**
 * Default Categories
 *
 * Categorias pré-definidas para novos usuários.
 */

import type { CategoryType } from '@/shared/models/Category.model';

export interface DefaultCategory {
  name: string;
  icon: string;
  color: string;
  category_type: CategoryType;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expense Categories
  { name: 'Alimentação', icon: 'Utensils', color: '#10B981', category_type: 'expense' },
  { name: 'Transporte', icon: 'Car', color: '#3B82F6', category_type: 'expense' },
  { name: 'Moradia', icon: 'Home', color: '#F59E0B', category_type: 'expense' },
  { name: 'Lazer', icon: 'Gamepad2', color: '#8B5CF6', category_type: 'expense' },
  { name: 'Saúde', icon: 'Heart', color: '#EF4444', category_type: 'expense' },
  { name: 'Educação', icon: 'BookOpen', color: '#06B6D4', category_type: 'expense' },
  { name: 'Compras', icon: 'ShoppingBag', color: '#EC4899', category_type: 'expense' },
  { name: 'Serviços', icon: 'Wrench', color: '#64748B', category_type: 'expense' },
  { name: 'Assinaturas', icon: 'CreditCard', color: '#7C3AED', category_type: 'expense' },
  { name: 'Outros', icon: 'MoreHorizontal', color: '#94A3B8', category_type: 'expense' },

  // Income Categories
  { name: 'Salário', icon: 'Briefcase', color: '#10B981', category_type: 'income' },
  { name: 'Investimentos', icon: 'TrendingUp', color: '#059669', category_type: 'income' },
  { name: 'Freelance', icon: 'Laptop', color: '#0EA5E9', category_type: 'income' },
  { name: 'Vendas', icon: 'Tag', color: '#F97316', category_type: 'income' },
  { name: 'Outros', icon: 'Plus', color: '#6B7280', category_type: 'income' },
];

export const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (cat) => cat.category_type === 'expense'
);

export const INCOME_CATEGORIES = DEFAULT_CATEGORIES.filter(
  (cat) => cat.category_type === 'income'
);

export default DEFAULT_CATEGORIES;
