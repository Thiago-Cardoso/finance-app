import { test } from '@playwright/test'

test('dashboard with dynamic colors', async ({ page }) => {
  // Set up auth token in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock-token-12345');
  });

  // Mock the dashboard API - note: API_BASE_URL is http://localhost:3001
  await page.route('**/*3001/dashboard*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
        summary: {
          current_month: {
            income: 15750.00,
            expenses: 8420.50,
            balance: 7329.50,
            transactions_count: 45
          },
          previous_month: {
            income: 14200.00,
            expenses: 9100.00,
            balance: 5100.00
          },
          variation: {
            percentage: 43.7,
            trend: 'up',
            amount: 2229.50
          }
        },
        current_balance: {
          raw: 28450.75,
          formatted: 'R$ 28.450,75'
        },
        monthly_evolution: [
          { month: '2025-01', month_name: 'Jan', income: 12000, expenses: 8500, balance: 3500, formatted_income: 'R$ 12.000,00', formatted_expenses: 'R$ 8.500,00', formatted_balance: 'R$ 3.500,00' },
          { month: '2025-02', month_name: 'Fev', income: 13500, expenses: 9200, balance: 4300, formatted_income: 'R$ 13.500,00', formatted_expenses: 'R$ 9.200,00', formatted_balance: 'R$ 4.300,00' },
          { month: '2025-03', month_name: 'Mar', income: 14200, expenses: 9100, balance: 5100, formatted_income: 'R$ 14.200,00', formatted_expenses: 'R$ 9.100,00', formatted_balance: 'R$ 5.100,00' },
          { month: '2025-04', month_name: 'Abr', income: 15750, expenses: 8420, balance: 7330, formatted_income: 'R$ 15.750,00', formatted_expenses: 'R$ 8.420,00', formatted_balance: 'R$ 7.330,00' }
        ],
        top_categories: [
          { category_id: '1', category_name: 'Alimentação', amount: 2340.00, percentage: 27.8, color: '#ef4444', formatted_amount: 'R$ 2.340,00' },
          { category_id: '2', category_name: 'Transporte', amount: 1850.00, percentage: 22.0, color: '#f59e0b', formatted_amount: 'R$ 1.850,00' },
          { category_id: '3', category_name: 'Lazer', amount: 1420.50, percentage: 16.9, color: '#10b981', formatted_amount: 'R$ 1.420,50' },
          { category_id: '4', category_name: 'Saúde', amount: 980.00, percentage: 11.6, color: '#3b82f6', formatted_amount: 'R$ 980,00' },
          { category_id: '5', category_name: 'Educação', amount: 830.00, percentage: 9.9, color: '#8b5cf6', formatted_amount: 'R$ 830,00' }
        ],
        budget_status: [],
        recent_transactions: [
          {
            id: '1',
            description: 'Supermercado Extra',
            amount: 342.50,
            transaction_type: 'expense',
            date: '2025-10-03',
            category: { id: '1', name: 'Alimentação', color: '#ef4444' },
            account: { id: '1', name: 'Banco Inter' }
          },
          {
            id: '2',
            description: 'Salário Outubro',
            amount: 7500.00,
            transaction_type: 'income',
            date: '2025-10-01',
            category: { id: '2', name: 'Salário', color: '#10b981' },
            account: { id: '1', name: 'Banco Inter' }
          },
          {
            id: '3',
            description: 'Uber - Centro',
            amount: 45.80,
            transaction_type: 'expense',
            date: '2025-10-02',
            category: { id: '3', name: 'Transporte', color: '#f59e0b' },
            account: { id: '2', name: 'Nubank' }
          },
          {
            id: '4',
            description: 'Netflix',
            amount: 55.90,
            transaction_type: 'expense',
            date: '2025-10-01',
            category: { id: '4', name: 'Lazer', color: '#10b981' },
            account: { id: '2', name: 'Nubank' }
          },
          {
            id: '5',
            description: 'Academia - Mensalidade',
            amount: 129.00,
            transaction_type: 'expense',
            date: '2025-09-30',
            category: { id: '5', name: 'Saúde', color: '#3b82f6' },
            account: { id: '1', name: 'Banco Inter' }
          }
        ],
        goals_progress: [
          {
            goal_id: '1',
            title: 'Viagem Europa',
            target_amount: 25000.00,
            current_amount: 18750.00,
            progress_percentage: 75.0,
            days_remaining: 120,
            target_date: '2026-02-01'
          },
          {
            goal_id: '2',
            title: 'Fundo Emergência',
            target_amount: 30000.00,
            current_amount: 16500.00,
            progress_percentage: 55.0,
            days_remaining: 180,
            target_date: '2026-04-01'
          },
          {
            goal_id: '3',
            title: 'Novo Notebook',
            target_amount: 8000.00,
            current_amount: 2400.00,
            progress_percentage: 30.0,
            days_remaining: 60,
            target_date: '2025-12-01'
          }
        ],
        last_updated: new Date().toISOString()
        }
      })
    })
  })

  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard')

  // Wait for dashboard content to appear
  await page.getByText('Transações Recentes').waitFor()

  // Take full page screenshot regardless
  await page.screenshot({
    path: 'dashboard-improved.png',
    fullPage: true
  })

  console.log('Screenshot saved as dashboard-improved.png')
})
