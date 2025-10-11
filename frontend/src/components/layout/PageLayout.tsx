import { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { VStack } from '@/components/ui/Stack'
import { cn } from '@/lib/utils'

export interface PageLayoutProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full'
  noPadding?: boolean
}

export function PageLayout({
  children,
  className,
  maxWidth = '7xl',
  noPadding = false,
}: PageLayoutProps) {
  return (
    <Container
      maxWidth={maxWidth}
      padding={noPadding ? 'none' : 'md'}
      className={cn('min-h-screen py-6', className)}
    >
      <VStack spacing={6} className="w-full">
        {children}
      </VStack>
    </Container>
  )
}

PageLayout.displayName = 'PageLayout'
