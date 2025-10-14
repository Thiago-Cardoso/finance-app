'use client'

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  AnalyticsFilters,
  FinancialSummaryResponse,
  BudgetPerformanceResponse,
  TrendsDataResponse,
  ReportListResponse,
  ExportRequest,
  FinancialSummary,
  BudgetPerformance,
  TrendsData,
} from '@/types/analytics'

// Hook for fetching financial summary
export function useFinancialSummary(
  filters: AnalyticsFilters
): UseQueryResult<FinancialSummaryResponse, Error> {
  return useQuery({
    queryKey: ['analytics', 'financial-summary', filters],
    queryFn: () => apiClient.get<FinancialSummaryResponse>('/analytics/financial_summary', filters as Record<string, unknown>),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  })
}

// Hook for fetching budget performance
export function useBudgetPerformance(
  filters: AnalyticsFilters
): UseQueryResult<BudgetPerformanceResponse, Error> {
  return useQuery({
    queryKey: ['analytics', 'budget-performance', filters],
    queryFn: () => apiClient.get<BudgetPerformanceResponse>('/analytics/budget_performance', filters as Record<string, unknown>),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for fetching trends data
export function useTrends(
  period: string = 'monthly',
  monthsBack: number = 12
): UseQueryResult<TrendsDataResponse, Error> {
  return useQuery({
    queryKey: ['analytics', 'trends', period, monthsBack],
    queryFn: () => apiClient.get<TrendsDataResponse>('/analytics/trends', {
      period,
      months_back: monthsBack,
    }),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Hook for listing reports
export function useReportsList(
  page: number = 1,
  perPage: number = 20
): UseQueryResult<ReportListResponse, Error> {
  return useQuery({
    queryKey: ['analytics', 'reports', page, perPage],
    queryFn: () => apiClient.get<ReportListResponse>('/analytics/reports', {
      page,
      per_page: perPage,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for getting a specific report
export function useReport(reportId: number | null): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: ['analytics', 'report', reportId],
    queryFn: () => apiClient.get(`/analytics/reports/${reportId}`),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Hook for deleting a report
export function useDeleteReport(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reportId: number) => apiClient.delete(`/analytics/reports/${reportId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports'] })
    },
  })
}

// Hook for exporting reports
export function useExportReport(): UseMutationResult<void, Error, ExportRequest> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: ExportRequest) => {
      const { report_type, format, filters, name } = request

      // Get file extension
      const ext = format === 'xlsx' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'
      const fileName = name ? `${name}.${ext}` : `${report_type}_${new Date().toISOString().split('T')[0]}.${ext}`

      // Fetch blob
      const blob = await apiClient.getBlob('/analytics/export', {
        report_type,
        format,
        ...filters,
      } as Record<string, unknown>)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    onSuccess: () => {
      // Optionally invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

// Typed data extraction helpers
export function useFinancialSummaryData(filters: AnalyticsFilters): {
  data: FinancialSummary | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const query = useFinancialSummary(filters)
  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useBudgetPerformanceData(filters: AnalyticsFilters): {
  data: BudgetPerformance | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const query = useBudgetPerformance(filters)
  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useTrendsData(period: string = 'monthly', monthsBack: number = 12): {
  data: TrendsData | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
} {
  const query = useTrends(period, monthsBack)
  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
