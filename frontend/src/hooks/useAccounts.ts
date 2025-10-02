import { useQuery } from '@tanstack/react-query'
import { accountsService } from '@/services/transactions'

export const accountKeys = {
  all: ['accounts'] as const,
}

export function useAccounts() {
  return useQuery({
    queryKey: accountKeys.all,
    queryFn: async () => {
      const response = await accountsService.getAll()
      return response.data
    },
  })
}
