'use client'

export function TransactionItemSkeleton() {
  return (
    <div className="animate-pulse p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div className="flex-1 space-y-3">
          {/* Description */}
          <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-48"></div>

          {/* Category + Date */}
          <div className="flex gap-3">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-24"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-32"></div>
          </div>
        </div>

        {/* Amount */}
        <div className="ml-4">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-24"></div>
        </div>
      </div>
    </div>
  )
}
