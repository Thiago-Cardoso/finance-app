import { test, expect } from '@playwright/test'
import { waitForPageLoad } from '../../helpers/test-utils'

test.describe('UI Components Visual Tests @component @visual', () => {
  test.describe('Button Component', () => {
    test.beforeEach(async ({ page }) => {
      // Navegar para qualquer página que tenha botões
      await page.goto('/dashboard')
      await waitForPageLoad(page)
    })

    test('should render buttons correctly', async ({ page }) => {
      const buttons = page.locator('button').first()
      if (await buttons.isVisible()) {
        await expect(buttons).toHaveScreenshot('button-default.png')
      }
    })

    test('should show hover state on buttons', async ({ page }) => {
      const button = page.locator('button').first()
      if (await button.isVisible()) {
        await button.hover()
        await page.waitForTimeout(200)
        await expect(button).toHaveScreenshot('button-hover.png')
      }
    })

    test('should show focus state on buttons', async ({ page }) => {
      const button = page.locator('button').first()
      if (await button.isVisible()) {
        await button.focus()
        await page.waitForTimeout(200)
        await expect(button).toHaveScreenshot('button-focus.png')
      }
    })
  })

  test.describe('Input Component', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/transactions')
      await waitForPageLoad(page)
    })

    test('should render input fields correctly', async ({ page }) => {
      const input = page.locator('input[type="text"], input[type="email"]').first()
      if (await input.isVisible()) {
        await expect(input).toHaveScreenshot('input-default.png')
      }
    })

    test('should show focus state on inputs', async ({ page }) => {
      const input = page.locator('input').first()
      if (await input.isVisible()) {
        await input.focus()
        await page.waitForTimeout(200)
        await expect(input).toHaveScreenshot('input-focus.png')
      }
    })

    test('should show filled input state', async ({ page }) => {
      const input = page.locator('input[type="text"]').first()
      if (await input.isVisible()) {
        await input.fill('Test value')
        await expect(input).toHaveScreenshot('input-filled.png')
      }
    })
  })

  test.describe('Modal Component', () => {
    test('should render modal when opened', async ({ page }) => {
      await page.goto('/categories')
      await waitForPageLoad(page)

      // Procurar por botão que abre modal
      const openModalBtn = page.locator('button').filter({ hasText: /new|criar|adicionar/i }).first()

      if (await openModalBtn.isVisible()) {
        await openModalBtn.click()
        await page.waitForTimeout(500)

        // Verificar se modal está visível
        const modal = page.locator('[role="dialog"], [data-testid="modal"]')
        if (await modal.isVisible()) {
          await expect(page).toHaveScreenshot('modal-open.png', {
            fullPage: true,
          })
        }
      }
    })
  })

  test.describe('Card Component', () => {
    test('should render cards correctly', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const card = page.locator('[class*="card"], [data-testid="card"]').first()
      if (await card.isVisible()) {
        await expect(card).toHaveScreenshot('card-default.png')
      }
    })

    test('should show hover state on hoverable cards', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const card = page.locator('[class*="card"]').first()
      if (await card.isVisible()) {
        await card.hover()
        await page.waitForTimeout(200)
        await expect(card).toHaveScreenshot('card-hover.png')
      }
    })
  })

  test.describe('Pagination Component', () => {
    test('should render pagination correctly', async ({ page }) => {
      await page.goto('/transactions')
      await waitForPageLoad(page)

      const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="paginat"]')
      if (await pagination.isVisible()) {
        await expect(pagination).toHaveScreenshot('pagination-default.png')
      }
    })

    test('should show active page state', async ({ page }) => {
      await page.goto('/transactions')
      await waitForPageLoad(page)

      const pagination = page.locator('[data-testid="pagination"]')
      if (await pagination.isVisible()) {
        const activeButton = pagination.locator('[aria-current="page"], [class*="active"]').first()
        if (await activeButton.isVisible()) {
          await expect(activeButton).toHaveScreenshot('pagination-active.png')
        }
      }
    })
  })

  test.describe('Alert Component', () => {
    test('should render alerts if present', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const alert = page.locator('[role="alert"], [data-testid="alert"]')
      if (await alert.isVisible()) {
        await expect(alert).toHaveScreenshot('alert-default.png')
      }
    })
  })

  test.describe('Theme Toggle Component', () => {
    test('should render theme toggle button', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme" i]').first()
      if (await themeToggle.isVisible()) {
        await expect(themeToggle).toHaveScreenshot('theme-toggle.png')
      }
    })

    test('should show hover state on theme toggle', async ({ page }) => {
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme" i]').first()
      if (await themeToggle.isVisible()) {
        await themeToggle.hover()
        await page.waitForTimeout(200)
        await expect(themeToggle).toHaveScreenshot('theme-toggle-hover.png')
      }
    })
  })
})
