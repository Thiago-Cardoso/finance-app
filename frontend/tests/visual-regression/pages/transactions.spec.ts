import { test, expect } from '@playwright/test'
import { waitForPageLoad } from '../../helpers/test-utils'

test.describe('Transactions Visual Tests @visual @page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/transactions')
    await waitForPageLoad(page)
  })

  test('should render transactions page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /transa/i })).toBeVisible()

    await expect(page).toHaveScreenshot('transactions-full-page.png', {
      fullPage: true,
      maxDiffPixels: 100,
    })
  })

  test('should render transactions header with filters', async ({ page }) => {
    const header = page.locator('header, [data-testid="page-header"]').first()
    await expect(header).toHaveScreenshot('transactions-header.png')
  })

  test('should render transactions list', async ({ page }) => {
    await page.waitForTimeout(1000)

    await expect(page).toHaveScreenshot('transactions-list.png', {
      fullPage: true,
    })
  })

  test('should render filters section', async ({ page }) => {
    const filters = page.locator('[data-testid="filters"], [class*="filter"]').first()
    if (await filters.isVisible()) {
      await expect(filters).toHaveScreenshot('transactions-filters.png')
    }
  })

  test('should render pagination if present', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="paginat"]')
    if (await pagination.isVisible()) {
      await expect(pagination).toHaveScreenshot('transactions-pagination.png')
    }
  })
})
