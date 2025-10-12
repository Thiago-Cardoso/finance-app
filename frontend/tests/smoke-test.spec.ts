import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Finance/i)
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('h1, h2')).toContainText(/login|entrar/i)
  })
})
