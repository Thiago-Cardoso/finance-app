'use client'

import { useState, useEffect } from 'react'
import { ReportFilters } from '@/components/reports/ReportFilters/ReportFilters'
import { FinancialSummaryDashboard } from '@/components/reports/FinancialSummaryDashboard/FinancialSummaryDashboard'
import { BudgetPerformanceDashboard } from '@/components/reports/BudgetPerformanceDashboard/BudgetPerformanceDashboard'
import { Button } from '@/components/ui/Button/Button'
import { useFinancialSummaryData, useBudgetPerformanceData, useExportReport } from '@/hooks/useAnalytics'
import { AnalyticsFilters } from '@/types/analytics'
import { useLocale } from '@/contexts/LocaleContext'
import { cn } from '@/lib/utils'
import { FileText, PieChart, TrendingUp, Settings, Download } from 'lucide-react'

type ReportTab = 'financial' | 'budget' | 'trends' | 'custom'

export default function ReportsPage() {
  const { t } = useLocale()
  const [activeTab, setActiveTab] = useState<ReportTab>('financial')
  const [filters, setFilters] = useState<AnalyticsFilters>({})

  // Initialize dates on client-side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    setFilters({
      start_date: startOfMonth.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0]
    })
  }, [])

  const { data: financialData, isLoading: financialLoading } = useFinancialSummaryData(filters)
  const { data: budgetData, isLoading: budgetLoading } = useBudgetPerformanceData(filters)
  const { mutate: exportReport, isPending: exporting } = useExportReport()

  const tabs = [
    { id: 'financial' as ReportTab, label: t('reports.tabs.financial'), icon: <FileText className="w-5 h-5" /> },
    { id: 'budget' as ReportTab, label: t('reports.tabs.budget'), icon: <PieChart className="w-5 h-5" /> },
    { id: 'trends' as ReportTab, label: t('reports.tabs.trends'), icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'custom' as ReportTab, label: t('reports.tabs.custom'), icon: <Settings className="w-5 h-5" /> }
  ]

  const handleExport = (format: 'pdf' | 'xlsx' | 'csv') => {
    const reportType = activeTab === 'financial' ? 'financial_summary' : 'budget_performance'
    exportReport({
      report_type: reportType,
      format,
      filters,
      name: `${reportType}-${new Date().toISOString().split('T')[0]}`
    })
  }

  const isLoading = activeTab === 'financial' ? financialLoading : budgetLoading

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('reports.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('reports.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ReportFilters
            initialFilters={filters}
            onFiltersChange={setFilters}
            loading={isLoading}
          />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <span className={cn(
                    'mr-2',
                    activeTab === tab.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Export Actions */}
          {(activeTab === 'financial' || activeTab === 'budget') && (
            <div className="flex justify-end space-x-2 mb-6">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('pdf')}
                loading={exporting}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {t('reports.export.pdf')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('xlsx')}
                loading={exporting}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {t('reports.export.excel')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport('csv')}
                loading={exporting}
                leftIcon={<Download className="w-4 h-4" />}
              >
                {t('reports.export.csv')}
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'financial' && (
            financialData ? (
              <FinancialSummaryDashboard
                data={financialData}
                loading={financialLoading}
              />
            ) : (
              <div className="p-8 text-center text-gray-500">
                {financialLoading ? t('reports.loading.financial') : t('reports.noData')}
              </div>
            )
          )}

          {activeTab === 'budget' && (
            budgetData ? (
              <BudgetPerformanceDashboard
                data={budgetData}
                loading={budgetLoading}
              />
            ) : (
              <div className="p-8 text-center text-gray-500">
                {budgetLoading ? t('reports.loading.budget') : t('reports.noData')}
              </div>
            )
          )}

          {activeTab === 'trends' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('reports.comingSoon.trends.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {t('reports.comingSoon.trends.description')}
              </p>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Settings className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('reports.comingSoon.custom.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {t('reports.comingSoon.custom.description')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
