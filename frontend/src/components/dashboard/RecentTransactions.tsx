import { Button } from '@/components/ui/Button'
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'
import { useLocale } from '@/contexts/LocaleContext'

interface Transaction {
  id: string
  description: string
  amount: number
  transaction_type: 'income' | 'expense' | 'transfer'
  date: string
  category?: {
    id: string
    name: string
    color: string
  }
  account?: {
    id: string
    name: string
  }
}

interface RecentTransactionsProps {
  data?: Transaction[]
}

export function RecentTransactions({ data }: RecentTransactionsProps) {
  const router = useRouter()
  const { t, locale, formatCurrency } = useLocale()
  const dateLocale = locale === 'pt-BR' ? ptBR : enUS

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('dashboard.recentTransactions')}
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {t('transactions.noTransactions')}
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      const dateFormat = locale === 'pt-BR' ? "dd/MM/yyyy" : "MM/dd/yyyy"
      return format(new Date(dateString), dateFormat, { locale: dateLocale })
    } catch {
      return dateString
    }
  }

  return (
    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100/50 dark:border-gray-700/50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/10 pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {t('dashboard.recentTransactions')}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/transactions')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 font-bold transition-all"
          >
            {t('dashboard.viewAll')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="space-y-2.5">
          {data.slice(0, 5).map((transaction) => {
            const isIncome = transaction.transaction_type === 'income'
            const isExpense = transaction.transaction_type === 'expense'
            const amount = transaction.amount
            const categoryColor = transaction.category?.color || '#6b7280'
            const amountColor = isIncome ? '#10b981' : isExpense ? '#f43f5e' : '#3b82f6'

            return (
              <div
                key={transaction.id}
                className="group flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 border border-gray-100/50 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/transactions/${transaction.id}`)}
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all"
                      style={{
                        background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}35)`
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-sm"
                        style={{ backgroundColor: categoryColor }}
                      />
                    </div>
                    {/* Type indicator badge */}
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full shadow-md flex items-center justify-center"
                      style={{ backgroundColor: amountColor }}
                    >
                      {isIncome ? (
                        <TrendingUp className="w-3 h-3 text-white" />
                      ) : isExpense ? (
                        <TrendingDown className="w-3 h-3 text-white" />
                      ) : (
                        <ArrowRight className="w-3 h-3 text-white rotate-180" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-semibold">{formatDate(transaction.date)}</span>
                      {transaction.category && (
                        <>
                          <span className="font-black">•</span>
                          <span
                            className="font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              color: categoryColor
                            }}
                          >
                            {transaction.category.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-3">
                  <div
                    className="text-base font-black"
                    style={{ color: amountColor }}
                  >
                    {isIncome && '+'}
                    {isExpense && '-'}
                    {formatCurrency(Math.abs(amount))}
                  </div>
                  {transaction.account && (
                    <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-0.5">
                      {transaction.account.name}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
