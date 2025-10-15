'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useDashboard } from '@/hooks/useDashboard'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { FinancialChart } from '@/components/dashboard/FinancialChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { TopCategories } from '@/components/dashboard/TopCategories'
import { GoalsProgress } from '@/components/dashboard/GoalsProgress'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PeriodFilter } from '@/components/dashboard/PeriodFilter'
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Grid, GridItem, VStack, HStack } from '@/components/ui'
import { Loader2, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const [period, setPeriod] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  })

  const { data, isLoading, error, refetch } = useDashboard(period)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <PageLayout>
        <HStack justify="center" align="center" className="min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando dashboard...</span>
        </HStack>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-300 font-medium">Erro ao carregar dashboard</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
          >
            Tentar novamente
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageLayout>
        {/* Header with Period Filter, Theme Toggle and Logout */}
        <PageHeader
          title="Dashboard"
          subtitle="Visão geral das suas finanças"
          actions={
            <HStack spacing={4}>
              <ThemeToggle />
              <PeriodFilter period={period} onPeriodChange={setPeriod} />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </HStack>
          }
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Summary Cards */}
        <SummaryCards data={data?.summary} currentBalance={data?.current_balance} />

        {/* Main Content Grid */}
        <Grid cols={3} gap={6}>
          {/* Financial Chart - Takes 2 columns */}
          <GridItem colSpan={12} colSpanLg={2}>
            <FinancialChart data={data?.monthly_evolution} />
          </GridItem>

          {/* Top Categories */}
          <GridItem colSpan={12} colSpanLg={1}>
            <TopCategories data={data?.top_categories} />
          </GridItem>
        </Grid>

        {/* Bottom Section */}
        <Grid cols={3} gap={6}>
          {/* Recent Transactions - Takes 2 columns */}
          <GridItem colSpan={12} colSpanLg={2}>
            <RecentTransactions data={data?.recent_transactions} />
          </GridItem>

          {/* Goals Progress */}
          <GridItem colSpan={12} colSpanLg={1}>
            <GoalsProgress data={data?.goals_progress} />
          </GridItem>
        </Grid>
      </PageLayout>
    </div>
  )
}
