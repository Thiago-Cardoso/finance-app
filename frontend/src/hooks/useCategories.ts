import { useQuery } from '@tanstack/react-query'
import { categoriesService } from '@/services/transactions'

export const categoryKeys = {
  all: ['categories'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const response = await categoriesService.getAll()
      return response.data
    },
  })
}
