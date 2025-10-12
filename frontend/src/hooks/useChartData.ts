'use client'

import { useMemo } from 'react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChartData } from '@/types/charts'

interface Transaction {
  id: number
  description: string
  amount: number
  raw_amount: number
  transaction_type: 'income' | 'expense' | 'transfer'
  date: string
  category?: {
    id: number
    name: string
    color: string
  }
}

export function useChartData(transactions: Transaction[]) {
  const monthlyEvolution = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date: format(date, 'yyyy-MM-dd'),
        name: format(date, 'dd/MM'),
        income: 0,
        expense: 0,
        balance: 0
      }
    })

    transactions.forEach(transaction => {
      const dayData = last30Days.find(day => day.date === transaction.date)
      if (dayData) {
        const amount = Number(transaction.raw_amount || transaction.amount)
        if (transaction.transaction_type === 'income') {
          dayData.income += amount
        } else if (transaction.transaction_type === 'expense') {
          dayData.expense += amount
        }
      }
    })

    // Calculate cumulative balance
    let cumulativeBalance = 0
    last30Days.forEach(day => {
      cumulativeBalance += day.income - day.expense
      day.balance = cumulativeBalance
    })

    return last30Days
  }, [transactions])

  const categoryDistribution = useMemo(() => {
    const categoryTotals = new Map<string, { name: string; value: number; color: string }>()

    transactions
      .filter(t => t.transaction_type === 'expense' && t.category)
      .forEach(transaction => {
        const categoryName = transaction.category!.name
        const existing = categoryTotals.get(categoryName)
        const amount = Number(transaction.raw_amount || transaction.amount)

        if (existing) {
          existing.value += amount
        } else {
          categoryTotals.set(categoryName, {
            name: categoryName,
            value: amount,
            color: transaction.category!.color
          })
        }
      })

    return Array.from(categoryTotals.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
  }, [transactions])

  const monthlyComparison = useMemo(() => {
    const currentMonth = {
      name: format(new Date(), 'MMM yyyy', { locale: ptBR }),
      income: 0,
      expense: 0
    }

    const lastMonth = {
      name: format(subDays(new Date(), 30), 'MMM yyyy', { locale: ptBR }),
      income: 0,
      expense: 0
    }

    const currentMonthStart = startOfMonth(new Date())
    const currentMonthEnd = endOfMonth(new Date())
    const lastMonthStart = startOfMonth(subDays(new Date(), 30))
    const lastMonthEnd = endOfMonth(subDays(new Date(), 30))

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date)
      const amount = Number(transaction.raw_amount || transaction.amount)

      if (transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd) {
        if (transaction.transaction_type === 'income') {
          currentMonth.income += amount
        } else if (transaction.transaction_type === 'expense') {
          currentMonth.expense += amount
        }
      } else if (transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd) {
        if (transaction.transaction_type === 'income') {
          lastMonth.income += amount
        } else if (transaction.transaction_type === 'expense') {
          lastMonth.expense += amount
        }
      }
    })

    return [lastMonth, currentMonth]
  }, [transactions])

  const incomeVsExpense = useMemo(() => {
    const result = {
      income: 0,
      expense: 0
    }

    transactions.forEach(transaction => {
      const amount = Number(transaction.raw_amount || transaction.amount)
      if (transaction.transaction_type === 'income') {
        result.income += amount
      } else if (transaction.transaction_type === 'expense') {
        result.expense += amount
      }
    })

    return [
      { name: 'Receitas', value: result.income, color: '#10b981' },
      { name: 'Despesas', value: result.expense, color: '#ef4444' }
    ]
  }, [transactions])

  return {
    monthlyEvolution,
    categoryDistribution,
    monthlyComparison,
    incomeVsExpense
  }
}
