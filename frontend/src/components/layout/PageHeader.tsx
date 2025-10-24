import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { HStack, VStack } from '@/components/ui/Stack'
import { Divider } from '@/components/ui/Divider'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  breadcrumbs?: ReactNode
  className?: string
  divider?: boolean
  showBackButton?: boolean
  backTo?: string
}

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className,
  divider = true,
  showBackButton = true,
  backTo = '/dashboard',
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className={cn('w-full', className)}>
      <VStack spacing={4}>
        {showBackButton && (
          <div>
            <Button
              variant="secondary"
              onClick={() => router.push(backTo)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
        )}

        {breadcrumbs && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs}
          </div>
        )}

        <HStack justify="between" align="start" className="w-full">
          <VStack spacing={2}>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </VStack>

          {actions && (
            <div className="flex-shrink-0">
              {actions}
            </div>
          )}
        </HStack>

        {divider && <Divider spacing="none" />}
      </VStack>
    </div>
  )
}

PageHeader.displayName = 'PageHeader'
