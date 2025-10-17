'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useCategoryStatistics } from '@/hooks/useCategories'
import { Category, CategoryFormData, CategoryFilters as CategoryFiltersType } from '@/types/category'
import { Button } from '@/components/ui/Button/Button'
import { SimpleModal } from '@/components/ui/Modal/SimpleModal'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryFilters } from '@/components/categories/CategoryFilters'
import { Pagination } from '@/components/ui/Pagination/Pagination'
import { CategoryStatistics } from '@/components/categories/CategoryStatistics'

export default function CategoriesPage() {
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  
  // All state declarations at the top
  const [filters, setFilters] = useState<CategoryFiltersType>({
    category_type: 'all',
  })
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>()

  // All hooks before any conditional returns
  const { data: categoryResponse, isLoading } = useCategories(filters, page)
  const categories = Array.isArray(categoryResponse?.data) ? categoryResponse.data : []
  const pagination = categoryResponse?.meta
  const { data: statistics } = useCategoryStatistics()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  // Check authentication after all hooks
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Autenticação Necessária
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Você precisa estar logado para acessar categorias. Por favor, faça login para continuar.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleCreateCategory = () => {
    setSelectedCategory(undefined)
    setIsFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
  }

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id, {
        onSuccess: () => {
          setCategoryToDelete(undefined)
        },
      })
    }
  }

  const handleFormSubmit = (data: CategoryFormData) => {
    if (selectedCategory) {
      updateMutation.mutate(
        { id: selectedCategory.id, data },
        {
          onSuccess: () => {
            setIsFormOpen(false)
            setSelectedCategory(undefined)
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false)
        },
      })
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedCategory(undefined)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Categorias
                  </h1>
                  {!isLoading && pagination && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-sm font-semibold text-blue-800 dark:text-blue-200 shadow-sm">
                      {pagination.total_count} total
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Organize suas finanças com categorias personalizadas
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  onClick={() => setIsStatsOpen(true)}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Estatísticas</span>
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Categoria</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <CategoryFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-52 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl shadow-md" />
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-6">
              <Plus className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {filters.category_type !== 'all' || filters.is_default !== undefined
                ? 'Nenhuma categoria encontrada'
                : 'Comece com Categorias'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {filters.category_type !== 'all' || filters.is_default !== undefined
                ? 'Tente ajustar seus filtros ou crie uma nova categoria'
                : 'Categorias ajudam você a organizar e rastrear suas receitas e despesas de forma eficiente'}
            </p>
            <div className="flex gap-3 justify-center">
              {(filters.category_type !== 'all' || filters.is_default !== undefined) && (
                <Button
                  variant="secondary"
                  onClick={() => setFilters({ category_type: 'all', search: '', is_default: undefined })}
                  className="shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Limpar Filtros
                </Button>
              )}
              <Button
                onClick={handleCreateCategory}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                {filters.category_type !== 'all' || filters.is_default !== undefined
                  ? 'Criar Categoria'
                  : 'Criar Sua Primeira Categoria'}
              </Button>
            </div>
          </div>
        )}

        {pagination && pagination.total_pages > 1 && (
          <Pagination
            currentPage={pagination.current_page || 1}
            totalPages={pagination.total_pages || 1}
            onPageChange={(newPage) => {
              setPage(newPage)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </div>

      {/* Category Form Modal */}
      <SimpleModal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={selectedCategory ? 'Editar Categoria' : 'Criar Categoria'}
        size="lg"
      >
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </SimpleModal>

      {/* Statistics Modal */}
      <SimpleModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title="Estatísticas de Categorias"
        size="2xl"
      >
        {statistics && <CategoryStatistics statistics={statistics} />}
      </SimpleModal>

      {/* Delete Confirmation Modal */}
      <SimpleModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(undefined)}
        title="Excluir Categoria"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Tem certeza que deseja excluir a categoria &ldquo;
            <span className="font-semibold">{categoryToDelete?.name}</span>&rdquo;?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setCategoryToDelete(undefined)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Excluir
            </Button>
          </div>
        </div>
      </SimpleModal>
    </div>
  )
}
