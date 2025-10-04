'use client'

import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { FinancialChart } from '@/components/dashboard/FinancialChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TopCategories } from '@/components/dashboard/TopCategories'
import { GoalsProgress } from '@/components/dashboard/GoalsProgress'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [period, setPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  })

  const { data, isLoading, error, refetch } = useDashboard(period)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-2 text-gray-600">Carregando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Erro ao carregar dashboard</p>
          <p className="text-red-600 text-sm mt-1">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Period Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Visão geral das suas finanças</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <PeriodFilter period={period} onPeriodChange={setPeriod} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Summary Cards */}
        <div className="mb-8">
          <SummaryCards data={data?.summary} currentBalance={data?.current_balance} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Financial Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <FinancialChart data={data?.monthly_evolution} />
          </div>

          {/* Top Categories */}
          <div className="lg:col-span-1">
            <TopCategories data={data?.top_categories} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentTransactions data={data?.recent_transactions} />
          </div>

          {/* Goals Progress */}
          <div className="lg:col-span-1">
            <GoalsProgress data={data?.goals_progress} />
          </div>
        </div>
      </div>
    </div>
  )
}
