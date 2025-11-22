---
status: pending
parallelizable: false
blocked_by: ["11.0"]
---

<task_context>
<domain>frontend/features</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>medium</complexity>
<dependencies>api|react|typescript|tailwindcss</dependencies>
<unblocks>"32.0"</unblocks>
</task_context>

# Tarefa 31.0: Frontend do Sistema de Categorias

## Visão Geral
Implementar interface completa de gerenciamento de categorias no frontend Next.js 15, incluindo listagem de categorias padrão e personalizadas, formulários de criação/edição, visualização de estatísticas, e integração com a API de categorias implementada na Task 11.0.

## Requisitos
- Interface responsiva para listar categorias (padrão + customizadas)
- Formulário para criar/editar categorias personalizadas
- Visualização de estatísticas de uso de categorias
- Filtros por tipo (receita/despesa) e status (ativa/inativa)
- Diferenciação visual entre categorias padrão e customizadas
- Seletor de cores e ícones para categorias
- Confirmação antes de excluir categorias
- Integração com API em /api/v1/categories
- Testes unitários e de integração
- Acessibilidade (WCAG AA)

## Subtarefas
- [ ] 31.1 Criar tipos TypeScript para categorias
- [ ] 31.2 Implementar hook useCategories para gerenciamento de estado
- [ ] 31.3 Desenvolver componente CategoryList para listagem
- [ ] 31.4 Criar componente CategoryCard para exibição individual
- [ ] 31.5 Implementar CategoryForm para criação/edição
- [ ] 31.6 Desenvolver ColorPicker para seleção de cores
- [ ] 31.7 Criar IconPicker para seleção de ícones
- [ ] 31.8 Implementar CategoryFilters para filtros
- [ ] 31.9 Desenvolver CategoryStatistics para visualização de estatísticas
- [ ] 31.10 Criar página de gerenciamento de categorias
- [ ] 31.11 Implementar modais de confirmação
- [ ] 31.12 Adicionar tratamento de erros e loading states
- [ ] 31.13 Implementar testes unitários dos componentes
- [ ] 31.14 Criar testes de integração da página

## Sequenciamento
- Bloqueado por: 11.0 (Sistema de Categorias Backend)
- Desbloqueia: 32.0 (Integração categorias com transações)
- Paralelizável: Não (depende da API de categorias)

## Detalhes de Implementação

### 1. Tipos TypeScript

```typescript
// src/types/category.ts
export type CategoryType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  color: string; // Hex color code
  icon: string; // Icon name or emoji
  category_type: CategoryType;
  is_default: boolean;
  is_active: boolean;
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
  is_active?: boolean;
}

export interface CategoryFilters {
  category_type?: CategoryType;
  is_active?: boolean;
  is_default?: boolean;
  search?: string;
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
    total_amount: number;
    transactions_count: number;
  }>;
  monthly_breakdown: Record<string, Record<string, number>>;
  category_trends: Record<string, {
    id: number;
    current_amount: number;
    previous_amount: number;
    change_percent: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

export interface CategoryResponse {
  success: boolean;
  data: Category | Category[];
  message?: string;
  meta?: {
    total_count: number;
    default_count: number;
    custom_count: number;
  };
}
```

### 2. Custom Hook - useCategories

```typescript
// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, CategoryFormData, CategoryFilters, CategoryStatistics } from '@/types/category';

export const useCategories = (filters?: CategoryFilters) => {
  const queryClient = useQueryClient();

  // Fetch all categories
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['categories', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category_type) params.append('category_type', filters.category_type);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.is_default !== undefined) params.append('is_default', String(filters.is_default));
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`/categories?${params.toString()}`);
      return response.data;
    }
  });

  // Fetch category statistics
  const {
    data: statisticsData,
    isLoading: isLoadingStats
  } = useQuery<CategoryStatistics>({
    queryKey: ['categories', 'statistics'],
    queryFn: async () => {
      const response = await api.get('/categories/statistics');
      return response.data.data;
    }
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await api.post('/categories', { category: data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'statistics'] });
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      const response = await api.put(`/categories/${id}`, { category: data });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'statistics'] });
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'statistics'] });
    }
  });

  return {
    categories: (categoriesData?.data || []) as Category[],
    meta: categoriesData?.meta,
    statistics: statisticsData,
    isLoading,
    isLoadingStats,
    error,
    refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};
```

### 3. Componente CategoryCard

```typescript
// src/components/categories/CategoryCard.tsx
import React from 'react';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, Trash2, Lock } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={category.category_type === 'income' ? 'success' : 'danger'}>
                {category.category_type === 'income' ? 'Receita' : 'Despesa'}
              </Badge>
              {category.is_default && (
                <Badge variant="secondary">
                  <Lock className="w-3 h-3 mr-1" />
                  Padrão
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!category.is_default && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(category)}
              aria-label="Editar categoria"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(category)}
              disabled={!category.usage_stats?.can_be_deleted}
              aria-label="Excluir categoria"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {category.usage_stats && (
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Transações</p>
            <p className="text-sm font-semibold text-gray-900">
              {category.usage_stats.transactions_count}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total no mês</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(category.usage_stats.total_amount_current_month)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 4. Componente CategoryForm

```typescript
// src/components/categories/CategoryForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import type { Category, CategoryFormData, CategoryType } from '@/types/category';

const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  category_type: z.enum(['income', 'expense']),
  is_active: z.boolean().optional()
});

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || {
      name: '',
      color: '#6366f1',
      icon: '📝',
      category_type: 'expense',
      is_active: true
    }
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const categoryType = watch('category_type');

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <Input
        label="Nome da Categoria"
        placeholder="Ex: Alimentação, Freelance..."
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Type */}
      <Select
        label="Tipo"
        error={errors.category_type?.message}
        required
        {...register('category_type')}
      >
        <option value="expense">Despesa</option>
        <option value="income">Receita</option>
      </Select>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor da Categoria <span className="text-red-500">*</span>
        </label>
        <ColorPicker
          value={selectedColor}
          onChange={(color) => setValue('color', color)}
        />
        {errors.color && (
          <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>
        )}
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ícone da Categoria <span className="text-red-500">*</span>
        </label>
        <IconPicker
          value={selectedIcon}
          onChange={(icon) => setValue('icon', icon)}
          categoryType={categoryType}
        />
        {errors.icon && (
          <p className="text-sm text-red-600 mt-1">{errors.icon.message}</p>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          {...register('is_active')}
        />
        <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
          Categoria ativa
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="flex-1"
        >
          {category ? 'Atualizar' : 'Criar'} Categoria
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
};
```

### 5. Componente ColorPicker

```typescript
// src/components/categories/ColorPicker.tsx
import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#84cc16', // Lime
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#6b7280', // Gray
  '#dc2626', // Dark Red
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [customColor, setCustomColor] = useState(value);

  return (
    <div className="space-y-4">
      {/* Preset Colors */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110"
            style={{
              backgroundColor: color,
              borderColor: value === color ? '#000' : 'transparent'
            }}
            aria-label={`Selecionar cor ${color}`}
          >
            {value === color && <Check className="w-5 h-5 text-white" />}
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Cor personalizada:</label>
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onChange(e.target.value);
          }}
          className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
        />
        <span className="text-sm text-gray-500 font-mono">{value}</span>
      </div>
    </div>
  );
};
```

### 6. Componente IconPicker

```typescript
// src/components/categories/IconPicker.tsx
import React from 'react';
import type { CategoryType } from '@/types/category';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  categoryType: CategoryType;
}

const EXPENSE_ICONS = [
  '🍔', '🚗', '🏥', '📚', '🎮', '🏠', '👕', '📱',
  '💄', '🐕', '📝', '🛡️', '📄', '✈️', '🎬', '☕'
];

const INCOME_ICONS = [
  '💼', '💻', '📈', '🛍️', '🎁', '🔄', '➕', '💰',
  '🏆', '📊', '🎯', '⭐', '🌟', '💎', '🔑', '🎪'
];

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  categoryType
}) => {
  const icons = categoryType === 'expense' ? EXPENSE_ICONS : INCOME_ICONS;

  return (
    <div className="grid grid-cols-8 gap-2">
      {icons.map((icon) => (
        <button
          key={icon}
          type="button"
          onClick={() => onChange(icon)}
          className={`
            w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xl
            transition-all hover:scale-110
            ${value === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
          `}
          aria-label={`Selecionar ícone ${icon}`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};
```

### 7. Página de Categorias

```typescript
// src/app/categories/page.tsx
'use client';

import React, { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { CategoryFilters } from '@/components/categories/CategoryFilters';
import { CategoryStatistics } from '@/components/categories/CategoryStatistics';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Plus, TrendingUp } from 'lucide-react';
import type { Category, CategoryFormData, CategoryFilters as Filters } from '@/types/category';

export default function CategoriesPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | undefined>();
  const [showStatistics, setShowStatistics] = useState(false);

  const {
    categories,
    meta,
    statistics,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting
  } = useCategories(filters);

  const handleCreate = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmCategory) return;

    try {
      await deleteCategory(deleteConfirmCategory.id);
      setDeleteConfirmCategory(undefined);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data });
      } else {
        await createCategory(data);
      }
      setIsFormOpen(false);
      setEditingCategory(undefined);
    } catch (error) {
      console.error('Failed to save category:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-1 text-gray-500">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowStatistics(true)}
            leftIcon={<TrendingUp className="w-4 h-4" />}
          >
            Estatísticas
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Filters */}
      <CategoryFilters filters={filters} onChange={setFilters} />

      {/* Meta Information */}
      {meta && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total de Categorias</p>
            <p className="text-2xl font-bold text-gray-900">{meta.total_count}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Categorias Padrão</p>
            <p className="text-2xl font-bold text-gray-900">{meta.default_count}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Categorias Personalizadas</p>
            <p className="text-2xl font-bold text-gray-900">{meta.custom_count}</p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando categorias...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">Nenhuma categoria encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={setDeleteConfirmCategory}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
      >
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmCategory}
        onClose={() => setDeleteConfirmCategory(undefined)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tem certeza que deseja excluir a categoria{' '}
            <strong>{deleteConfirmCategory?.name}</strong>?
          </p>
          {deleteConfirmCategory && !deleteConfirmCategory.usage_stats?.can_be_deleted && (
            <p className="text-sm text-red-600">
              Esta categoria possui transações associadas e não pode ser excluída.
            </p>
          )}
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={!deleteConfirmCategory?.usage_stats?.can_be_deleted}
              className="flex-1"
            >
              Excluir
            </Button>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmCategory(undefined)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Statistics Modal */}
      {showStatistics && statistics && (
        <Modal
          isOpen={showStatistics}
          onClose={() => setShowStatistics(false)}
          title="Estatísticas de Categorias"
          size="large"
        >
          <CategoryStatistics statistics={statistics} />
        </Modal>
      )}
    </div>
  );
}
```

### 8. Testes Unitários

```typescript
// __tests__/components/CategoryCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCard } from '@/components/categories/CategoryCard';
import type { Category } from '@/types/category';

const mockCategory: Category = {
  id: 1,
  name: 'Alimentação',
  color: '#ef4444',
  icon: '🍔',
  category_type: 'expense',
  is_default: false,
  is_active: true,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
  usage_stats: {
    transactions_count: 10,
    total_amount_current_month: 500.00,
    can_be_deleted: true
  }
};

describe('CategoryCard', () => {
  it('renders category information correctly', () => {
    render(<CategoryCard category={mockCategory} />);

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Despesa')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
  });

  it('shows default badge for default categories', () => {
    const defaultCategory = { ...mockCategory, is_default: true };
    render(<CategoryCard category={defaultCategory} />);

    expect(screen.getByText('Padrão')).toBeInTheDocument();
  });

  it('hides action buttons for default categories', () => {
    const defaultCategory = { ...mockCategory, is_default: true };
    render(<CategoryCard category={defaultCategory} />);

    expect(screen.queryByLabelText('Editar categoria')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Excluir categoria')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<CategoryCard category={mockCategory} onEdit={onEdit} />);

    fireEvent.click(screen.getByLabelText('Editar categoria'));
    expect(onEdit).toHaveBeenCalledWith(mockCategory);
  });

  it('disables delete button when category cannot be deleted', () => {
    const categoryWithTransactions = {
      ...mockCategory,
      usage_stats: { ...mockCategory.usage_stats!, can_be_deleted: false }
    };
    render(<CategoryCard category={categoryWithTransactions} />);

    expect(screen.getByLabelText('Excluir categoria')).toBeDisabled();
  });
});
```

## Critérios de Sucesso
- [ ] Interface responsiva funcionando em mobile, tablet e desktop
- [ ] Listagem de categorias com diferenciação visual entre padrão e customizadas
- [ ] Formulário de criação/edição validando todos os campos
- [ ] Seletor de cores com paleta predefinida e customização
- [ ] Seletor de ícones contextual por tipo de categoria
- [ ] Filtros operacionais por tipo, status e busca
- [ ] Estatísticas visualizadas com gráficos e métricas
- [ ] Modais de confirmação para ações destrutivas
- [ ] Loading states e mensagens de erro apropriadas
- [ ] Integração completa com API de categorias
- [ ] Testes unitários com cobertura > 80%
- [ ] Testes de integração da página principal
- [ ] Acessibilidade WCAG AA (navegação por teclado, ARIA labels, contraste)
- [ ] Performance otimizada (lazy loading, memoization)

## Recursos Necessários
- Desenvolvedor frontend React/Next.js experiente
- Designer para validar UI/UX (opcional)
- API de categorias (Task 11.0) funcionando
- Componentes UI base (Button, Input, Modal, etc.)

## Tempo Estimado
- Tipos TypeScript e hook: 2-3 horas
- Componentes de UI (Card, Form, Pickers): 6-8 horas
- Página principal e integração: 4-5 horas
- Modais e confirmações: 2-3 horas
- Estatísticas e visualizações: 3-4 horas
- Testes unitários: 4-5 horas
- Testes de integração: 2-3 horas
- Refinamentos e acessibilidade: 2-3 horas
- **Total**: 5-7 dias de trabalho

## Dependências Técnicas
- Next.js 15 configurado
- TailwindCSS instalado
- React Query (@tanstack/react-query) configurado
- React Hook Form instalado
- Zod para validação
- Lucide React para ícones
- API client configurado
- Componentes UI base implementados

## Observações
- As categorias padrão devem ser claramente identificadas como não editáveis
- Validar que categorias com transações não podem ser excluídas
- Implementar debounce na busca de categorias
- Considerar adicionar drag-and-drop para reordenação futura
- Manter consistência visual com resto da aplicação
