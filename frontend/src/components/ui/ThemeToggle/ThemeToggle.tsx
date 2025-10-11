'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors duration-200">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-all duration-200 touch-target ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-all duration-200 touch-target ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        aria-label="System mode"
        title="System mode"
      >
        <Monitor className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-all duration-200 touch-target ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-800 shadow-md text-blue-600'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  )
}
