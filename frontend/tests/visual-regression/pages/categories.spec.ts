import { test, expect } from '@playwright/test'
import { waitForPageLoad } from '../../helpers/test-utils'

test.describe('Categories Visual Tests @visual @page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/categories')
    await waitForPageLoad(page)
  })

  test('should render categories page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /categor/i })).toBeVisible()

    await expect(page).toHaveScreenshot('categories-full-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('should render categories header', async ({ page }) => {
    const header = page.locator('header, [data-testid="page-header"]').first()
    await expect(header).toHaveScreenshot('categories-header.png')
  })

  test('should render categories list', async ({ page }) => {
    // Aguardar lista de categorias ou estado vazio
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('categories-list.png', {
      fullPage: true,
    })
  })

  test('should render empty state if no categories', async ({ page }) => {
    // Se não houver categorias, deve mostrar estado vazio
    const emptyState = page.locator('[data-testid="empty-state"], [class*="empty"]')
    if (await emptyState.isVisible()) {
      await expect(emptyState).toHaveScreenshot('categories-empty-state.png')
    }
  })
})
