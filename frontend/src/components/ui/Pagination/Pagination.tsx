'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/Button/Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-2 flex items-center gap-1">
        {/* First Page Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Previous</span>
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 px-2">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-500 dark:text-gray-400">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                disabled={currentPage === page}
                className={`
                  h-9 min-w-[2.25rem] px-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${currentPage === page
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20'
                  }
                  disabled:cursor-not-allowed
                `}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
        >
          <span className="mr-1 hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Info */}
      <div className="hidden md:block text-sm text-gray-600 dark:text-gray-400 ml-2">
        Page <span className="font-semibold text-gray-900 dark:text-gray-100">{currentPage}</span> of{' '}
        <span className="font-semibold text-gray-900 dark:text-gray-100">{totalPages}</span>
      </div>
    </div>
  )
}
