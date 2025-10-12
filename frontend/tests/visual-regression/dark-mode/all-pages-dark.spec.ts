import { test, expect } from '@playwright/test'
import { enableDarkMode, disableDarkMode, waitForPageLoad } from '../../helpers/test-utils'

const pages = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/transactions', name: 'transactions' },
  { path: '/categories', name: 'categories' },
]

test.describe('Dark Mode Visual Tests @dark @visual', () => {
  for (const { path, name } of pages) {
    test(`${name} - Light Mode`, async ({ page }) => {
      await page.goto(path)
      await disableDarkMode(page)
      await page.reload()
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot(`${name}-light-mode.png`, {
        fullPage: true,
        maxDiffPixels: 150,
      })
    })

    test(`${name} - Dark Mode`, async ({ page }) => {
      await page.goto(path)
      await enableDarkMode(page)
      await page.reload()
      await waitForPageLoad(page)

      await expect(page).toHaveScreenshot(`${name}-dark-mode.png`, {
        fullPage: true,
        maxDiffPixels: 150,
      })
    })
  }

  test('Theme toggle functionality', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // Procurar pelo botão de toggle de tema
    const themeToggle = page.locator('[data-testid="theme-toggle"], button[aria-label*="theme" i], button[aria-label*="tema" i]').first()

    if (await themeToggle.isVisible()) {
      // Screenshot no modo light
      await disableDarkMode(page)
      await page.reload()
      await waitForPageLoad(page)
      await expect(page).toHaveScreenshot('theme-before-toggle.png', {
        fullPage: true,
      })

      // Clicar no toggle
      await themeToggle.click()
      await page.waitForTimeout(500) // Aguardar animação

      // Screenshot no modo dark
      await expect(page).toHaveScreenshot('theme-after-toggle.png', {
        fullPage: true,
      })
    }
  })

  test('Verify dark mode colors are different from light mode', async ({ page }) => {
    await page.goto('/dashboard')
    await waitForPageLoad(page)

    // Capturar cor de fundo no modo light
    await disableDarkMode(page)
    await page.reload()
    await waitForPageLoad(page)

    const lightBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Capturar cor de fundo no modo dark
    await enableDarkMode(page)
    await page.reload()
    await waitForPageLoad(page)

    const darkBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Verificar que as cores são diferentes
    expect(lightBgColor).not.toBe(darkBgColor)
  })
})
