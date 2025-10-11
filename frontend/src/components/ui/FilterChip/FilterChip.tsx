'use client'

import { X } from 'lucide-react'

interface FilterChipProps {
  label: string
  value: string
  onRemove: () => void
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium border border-blue-200 dark:border-blue-800 transition-all duration-200 hover:shadow-md">
      <span>
        {label}: <span className="font-semibold">{value}</span>
      </span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition-colors duration-200"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
