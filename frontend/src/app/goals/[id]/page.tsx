'use client'

import { useParams, useRouter } from 'next/navigation'
import { useGoal } from '@/hooks/useGoals'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { HStack, VStack, Grid, GridItem } from '@/components/ui'
import { Loader2 } from 'lucide-react'
import { GoalProgress } from '@/components/goals/GoalProgress'
import { GoalMilestones } from '@/components/goals/GoalMilestones'
import { ContributionsList } from '@/components/goals/ContributionsList'
import { GoalActivities } from '@/components/goals/GoalActivities'
import { ContributionForm } from '@/components/goals/ContributionForm'
import { GoalStatusBadge } from '@/components/goals/GoalStatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const goalId = parseInt(params.id as string)

  const { data: goal, isLoading, error } = useGoal(goalId)

  if (isLoading) {
    return (
      <PageLayout>
        <HStack justify="center" align="center" className="min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando meta...</span>
        </HStack>
      </PageLayout>
    )
  }

  if (error || !goal) {
    return (
      <PageLayout>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-800 dark:text-red-300 font-medium">Meta não encontrada</p>
          <button
            onClick={() => router.push('/goals')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Voltar para Metas
          </button>
        </div>
      </PageLayout>
    )
  }

  const targetAmount = typeof goal.target_amount === 'string'
    ? parseFloat(goal.target_amount)
    : goal.target_amount

  const currentAmount = typeof goal.current_amount === 'string'
    ? parseFloat(goal.current_amount)
    : goal.current_amount

  const progress = typeof goal.progress_percentage === 'string'
    ? parseFloat(goal.progress_percentage)
    : (goal.progress_percentage || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageLayout>
        <PageHeader
          title={goal.name}
          subtitle={goal.description || ''}
          showBackButton={true}
        />

        {/* Goal Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <GoalStatusBadge status={goal.status} />
            {goal.auto_track_progress && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                🤖 Rastreamento Automático
              </span>
            )}
          </div>

          <Grid cols={4} gap={4}>
            <GridItem>
              <VStack spacing={1}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor Atual</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentAmount)}
                </p>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={1}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valor Meta</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(targetAmount)}
                </p>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={1}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {progress.toFixed(1)}%
                </p>
              </VStack>
            </GridItem>

            <GridItem>
              <VStack spacing={1}>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data Limite</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDate(goal.target_date)}
                </p>
              </VStack>
            </GridItem>
          </Grid>

          {goal.category && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Categoria Vinculada:</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{goal.category.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">{goal.category.name}</span>
                {goal.auto_track_progress && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    (Transações desta categoria atualizam a meta automaticamente)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <GoalProgress goal={goal} />

        {/* Two Column Layout */}
        <Grid cols={2} gap={6}>
          {/* Left Column */}
          <GridItem>
            <VStack spacing={6}>
              {/* Add Contribution Form */}
              {goal.status === 'active' && !goal.auto_track_progress && (
                <ContributionForm goalId={goal.id} />
              )}

              {goal.status === 'active' && goal.auto_track_progress && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>Rastreamento Automático Ativo:</strong><br/>
                    Esta meta é atualizada automaticamente quando você cria transações na categoria "{goal.category?.name}".
                    Não é necessário adicionar contribuições manualmente.
                  </p>
                </div>
              )}

              {/* Contributions List */}
              <ContributionsList contributions={goal.goal_contributions || []} />
            </VStack>
          </GridItem>

          {/* Right Column */}
          <GridItem>
            <VStack spacing={6}>
              {/* Milestones */}
              {goal.goal_milestones && goal.goal_milestones.length > 0 && (
                <GoalMilestones
                  milestones={goal.goal_milestones}
                  currentProgress={progress}
                />
              )}

              {/* Activities */}
              {goal.goal_activities && goal.goal_activities.length > 0 && (
                <GoalActivities activities={goal.goal_activities} />
              )}
            </VStack>
          </GridItem>
        </Grid>
      </PageLayout>
    </div>
  )
}
