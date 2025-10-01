import { http, HttpResponse } from 'msw'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/api/v1/auth/sign_in`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          confirmed_at: '2024-01-01T00:00:00.000Z',
        },
        access_token: 'mock-jwt-access-token',
        refresh_token: 'mock-jwt-refresh-token',
        expires_in: 86400,
      },
      message: 'Signed in successfully',
    })
  }),

  http.post(`${API_URL}/api/v1/auth/sign_up`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: 1,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          confirmed_at: null,
        },
        access_token: 'mock-jwt-access-token',
        refresh_token: 'mock-jwt-refresh-token',
        expires_in: 86400,
      },
      message: 'User created successfully',
    })
  }),

  http.delete(`${API_URL}/api/v1/auth/sign_out`, () => {
    return HttpResponse.json({
      success: true,
      data: {},
      message: 'Signed out successfully',
    })
  }),

  http.post(`${API_URL}/api/v1/auth/refresh_token`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        access_token: 'new-mock-jwt-access-token',
        refresh_token: 'new-mock-jwt-refresh-token',
        expires_in: 86400,
      },
      message: 'Token refreshed successfully',
    })
  }),

  // Transactions endpoints
  http.get(`${API_URL}/api/v1/transactions`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          description: 'Test Transaction',
          amount: '100.00',
          transaction_type: 'expense',
          date: '2024-01-15',
          category: {
            id: 1,
            name: 'Alimentação',
            color: '#ef4444',
          },
          account: {
            id: 1,
            name: 'Conta Corrente',
            account_type: 'checking',
          },
        },
      ],
      meta: {
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_count: 1,
          per_page: 20,
        },
      },
    })
  }),

  http.post(`${API_URL}/api/v1/transactions`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 2,
        description: 'New Transaction',
        amount: '50.00',
        transaction_type: 'expense',
        date: '2024-01-16',
        category: {
          id: 1,
          name: 'Alimentação',
          color: '#ef4444',
        },
      },
      message: 'Transaction created successfully',
    })
  }),

  // Dashboard endpoint
  http.get(`${API_URL}/api/v1/dashboard`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        summary: {
          current_month: {
            income: '5500.00',
            expenses: '3200.00',
            balance: '2300.00',
          },
          current_balance: '12500.00',
        },
        recent_transactions: [
          {
            id: 1,
            description: 'Recent Transaction',
            amount: '100.00',
            transaction_type: 'expense',
            date: '2024-01-15',
          },
        ],
        top_categories: [
          {
            name: 'Alimentação',
            total: '1200.00',
            percentage: 37.5,
            color: '#ef4444',
          },
        ],
        monthly_evolution: [
          {
            month: '2024-01',
            income: '5500.00',
            expenses: '3200.00',
          },
        ],
      },
    })
  }),

  // Categories endpoints
  http.get(`${API_URL}/api/v1/categories`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Alimentação',
          color: '#ef4444',
          category_type: 'expense',
          is_default: true,
          is_active: true,
        },
        {
          id: 2,
          name: 'Transporte',
          color: '#3b82f6',
          category_type: 'expense',
          is_default: true,
          is_active: true,
        },
      ],
    })
  }),

  // Accounts endpoints
  http.get(`${API_URL}/api/v1/accounts`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Conta Corrente',
          account_type: 'checking',
          initial_balance: '1000.00',
          current_balance: '1500.00',
          is_active: true,
        },
      ],
    })
  }),

  // Error simulation
  http.get(`${API_URL}/api/v1/error`, () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: [{ field: 'server', message: 'Something went wrong' }],
      },
      { status: 500 }
    )
  }),

  // 404 simulation
  http.get(`${API_URL}/api/v1/not-found`, () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Resource not found',
        errors: [{ field: 'id', message: 'Record not found' }],
      },
      { status: 404 }
    )
  }),

  // 401 unauthorized simulation
  http.get(`${API_URL}/api/v1/unauthorized`, () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Unauthorized',
        errors: [{ field: 'authorization', message: 'Invalid or missing token' }],
      },
      { status: 401 }
    )
  }),
]
