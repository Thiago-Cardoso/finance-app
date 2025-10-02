import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { transactionsService } from '@/services/transactions'
import { TransactionFormData, TransactionFilters } from '@/types/transaction'

// Query keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...transactionKeys.details(), id] as const,
  summary: (start_date?: string, end_date?: string) =>
    [...transactionKeys.all, 'summary', start_date, end_date] as const,
}

// Get all transactions with filters
export function useTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: ({ pageParam }: { pageParam: number }) =>
      transactionsService.getAll({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.pagination) {
        const { current_page, total_pages } = lastPage.meta.pagination
        return current_page < total_pages ? current_page + 1 : undefined
      }
      return undefined
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      transactions: data.pages.flatMap((page) => page.data),
    }),
  })
}

// Get single transaction
export function useTransaction(id: number) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
  })
}

// Create transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransactionFormData) => transactionsService.create(data),
    onSuccess: () => {
      // Invalidate and refetch all transaction queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

// Update transaction
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TransactionFormData> }) =>
      transactionsService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

// Delete transaction
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => transactionsService.delete(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

// Get summary
export function useTransactionSummary(start_date?: string, end_date?: string) {
  return useQuery({
    queryKey: transactionKeys.summary(start_date, end_date),
    queryFn: () => transactionsService.getSummary(start_date, end_date),
  })
}
