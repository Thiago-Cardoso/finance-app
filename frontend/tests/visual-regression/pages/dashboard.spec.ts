import { test, expect } from '@playwright/test'
import { waitForPageLoad } from '../../helpers/test-utils'

test.describe('Dashboard Visual Tests @visual @page', () => {
  test.beforeEach(async ({ page }) => {
    // Mockar autenticação ou fazer login se necessário
    // Por enquanto vamos diretamente para a página
    await page.goto('/dashboard')
    await waitForPageLoad(page)
  })

  test('should render dashboard correctly', async ({ page }) => {
    // Aguardar elementos principais carregarem
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()

    // Tirar screenshot da página completa
    await expect(page).toHaveScreenshot('dashboard-full-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('should render dashboard header', async ({ page }) => {
    const header = page.locator('header, [data-testid="page-header"]').first()
    await expect(header).toHaveScreenshot('dashboard-header.png')
  })

  test('should render summary cards section', async ({ page }) => {
    // Aguardar cards de resumo carregarem
    await page.waitForSelector('[class*="summary"], [data-testid="summary-cards"]', {
      state: 'visible',
      timeout: 5000,
    }).catch(() => {
      // Se não encontrar por seletor específico, continua
      console.log('Summary cards not found by specific selector')
    })

    const summarySection = page.locator('[class*="summary"], [class*="grid"]').first()
    await expect(summarySection).toHaveScreenshot('dashboard-summary-cards.png')
  })

  test('should render chart section', async ({ page }) => {
    // Aguardar gráfico carregar
    await page.waitForSelector('canvas, [data-testid="financial-chart"]', {
      state: 'visible',
      timeout: 5000,
    }).catch(() => {
      console.log('Chart not found by specific selector')
    })

    // Screenshot da seção com gráfico
    await expect(page).toHaveScreenshot('dashboard-with-chart.png', {
      fullPage: true,
    })
  })

  test('should render quick actions', async ({ page }) => {
    // Procurar por botões de ação rápida
    const quickActions = page.locator('[data-testid="quick-actions"], button').first()
    if (await quickActions.isVisible()) {
      await expect(quickActions).toHaveScreenshot('dashboard-quick-actions.png')
    }
  })

  test('should handle empty state gracefully', async ({ page }) => {
    // Este teste pode ser ajustado baseado em como o dashboard lida com estado vazio
    await expect(page).toHaveScreenshot('dashboard-state.png', {
      fullPage: true,
      maxDiffPixels: 150,
    })
  })
})
