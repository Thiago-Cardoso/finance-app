'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLocale } from '@/contexts/LocaleContext'
import { useGoals } from '@/hooks/useGoals'
import { Button } from '@/components/ui/Button'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Grid, GridItem, HStack } from '@/components/ui'
import { Loader2, LogOut, Plus } from 'lucide-react'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalFormModal } from '@/components/goals/GoalFormModal'
import { GoalsSummary } from '@/components/goals/GoalsSummary'
import { GoalFilters } from '@/components/goals/GoalFilters'
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { GoalFilters as GoalFiltersType } from '@/types/goal'

export default function GoalsPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const { t } = useLocale()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState<GoalFiltersType>({})

  const { data, isLoading, error, refetch } = useGoals(filters)

  const goals = data?.data || []
  const meta = data?.meta

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <PageLayout>
        <HStack justify="center" align="center" className="min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</span>
        </HStack>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-300 font-medium">{t('errors.generic')}</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600"
          >
            {t('common.retry')}
          </button>
        </div>
      </PageLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageLayout>
        {/* Header */}
        <PageHeader
          title={t('goals.title')}
          subtitle={t('goals.subtitle')}
          showBackButton={true}
          actions={
            <HStack spacing={4}>
              <LanguageSelector />
              <ThemeToggle />
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('goals.new')}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('auth.logout')}</span>
              </Button>
            </HStack>
          }
        />

        {/* Summary */}
        {meta && <GoalsSummary meta={meta} />}

        {/* Filters */}
        <GoalFilters filters={filters} onFiltersChange={setFilters} />

        {/* Goals Grid */}
        {goals && goals.length > 0 ? (
          <Grid cols={1} gap={6}>
            {goals.map((goal) => (
              <GridItem key={goal.id}>
                <GoalCard goal={goal} />
              </GridItem>
            ))}
          </Grid>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('goals.empty')}
            </p>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{t('goals.create_first')}</span>
            </Button>
          </div>
        )}

        {/* Goal Form Modal */}
        <GoalFormModal
          goal={null}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            refetch()
          }}
        />
      </PageLayout>
    </div>
  )
}
