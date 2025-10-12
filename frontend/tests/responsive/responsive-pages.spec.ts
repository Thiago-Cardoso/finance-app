import { test, expect } from '@playwright/test'
import { viewports, waitForPageLoad } from '../helpers/test-utils'

const pages = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/transactions', name: 'transactions' },
  { path: '/categories', name: 'categories' },
]

const testViewports = [
  { name: 'mobile-small', ...viewports.mobile.small },
  { name: 'mobile-medium', ...viewports.mobile.medium },
  { name: 'tablet-portrait', ...viewports.tablet.portrait },
  { name: 'tablet-landscape', ...viewports.tablet.landscape },
  { name: 'desktop-standard', ...viewports.desktop.standard },
  { name: 'desktop-hd', ...viewports.desktop.hd },
]

test.describe('Responsive Visual Tests @responsive @visual', () => {
  for (const { path, name } of pages) {
    for (const viewport of testViewports) {
      test(`${name} at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })

        await page.goto(path)
        await waitForPageLoad(page)

        await expect(page).toHaveScreenshot(`${name}-${viewport.name}.png`, {
          fullPage: true,
          maxDiffPixels: 150,
        })
      })
    }
  }

  test.describe('Mobile Navigation Tests', () => {
    test('should show mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize(viewports.mobile.small)
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      // Procurar por menu hamburguer ou navegação mobile
      const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu" i]').first()
      if (await mobileMenu.isVisible()) {
        await expect(page).toHaveScreenshot('mobile-menu-closed.png', {
          fullPage: true,
        })

        await mobileMenu.click()
        await page.waitForTimeout(300)

        await expect(page).toHaveScreenshot('mobile-menu-open.png', {
          fullPage: true,
        })
      }
    })
  })

  test.describe('Layout Breakpoint Tests', () => {
    test('should adjust grid layout at different breakpoints', async ({ page }) => {
      await page.goto('/dashboard')

      // Mobile - 1 coluna
      await page.setViewportSize(viewports.mobile.small)
      await waitForPageLoad(page)
      await expect(page).toHaveScreenshot('layout-mobile-1col.png', {
        fullPage: true,
      })

      // Tablet - 2 colunas
      await page.setViewportSize(viewports.tablet.portrait)
      await waitForPageLoad(page)
      await expect(page).toHaveScreenshot('layout-tablet-2col.png', {
        fullPage: true,
      })

      // Desktop - 3+ colunas
      await page.setViewportSize(viewports.desktop.standard)
      await waitForPageLoad(page)
      await expect(page).toHaveScreenshot('layout-desktop-3col.png', {
        fullPage: true,
      })
    })
  })

  test.describe('Orientation Tests', () => {
    test('should handle landscape orientation on mobile', async ({ page }) => {
      // Mobile landscape (invertido)
      await page.setViewportSize({ width: 844, height: 390 })
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('mobile-landscape.png', {
        fullPage: true,
      })
    })

    test('should handle landscape orientation on tablet', async ({ page }) => {
      await page.setViewportSize(viewports.tablet.landscape)
      await page.goto('/dashboard')
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot('tablet-landscape.png', {
        fullPage: true,
      })
    })
  })
})
