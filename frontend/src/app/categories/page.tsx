'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, BarChart3, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useCategoryStatistics } from '@/hooks/useCategories'
import { Category, CategoryFormData, CategoryFilters as CategoryFiltersType } from '@/types/category'
import { Button } from '@/components/ui/Button/Button'
import { Modal } from '@/components/ui/Modal/Modal'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { CategoryFilters } from '@/components/categories/CategoryFilters'
import { CategoryStatistics } from '@/components/categories/CategoryStatistics'

export default function CategoriesPage() {
  const router = useRouter()
  const { token, loading: authLoading } = useAuth()
  const [filters, setFilters] = useState<CategoryFiltersType>({
    category_type: 'all',
  })

  // Check authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to be logged in to access categories. Please sign in to continue.
            </p>
            <Button onClick={() => router.push('/')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>()
  const [categoryToDelete, setCategoryToDelete] = useState<Category | undefined>()

  const { data: categories, isLoading } = useCategories(filters)
  const { data: statistics } = useCategoryStatistics()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your income and expense categories
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Statistics
          </Button>
          <Button onClick={handleCreateCategory} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <CategoryFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No categories found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first category
          </p>
          <Button onClick={handleCreateCategory}>Create Category</Button>
        </div>
      )}

      {/* Category Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={selectedCategory ? 'Edit Category' : 'Create Category'}
        size="lg"
      >
        <CategoryForm
          category={selectedCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Statistics Modal */}
      <Modal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title="Category Statistics"
        size="2xl"
      >
        {statistics && <CategoryStatistics statistics={statistics} />}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(undefined)}
        title="Delete Category"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the category "
            <span className="font-semibold">{categoryToDelete?.name}</span>"?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setCategoryToDelete(undefined)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
