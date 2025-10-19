'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/contexts/LocaleContext'

const languages = [
  {
    code: 'pt-BR' as const,
    name: 'Português (Brasil)',
    flag: '🇧🇷'
  },
  {
    code: 'en-US' as const,
    name: 'English (USA)',
    flag: '🇺🇸'
  }
]

export function LanguageSelector() {
  const { locale, setLocale, t } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (code: typeof locale) => {
    setLocale(code)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label={t('languageSelector.changeLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-2xl" role="img" aria-label={currentLanguage.name}>
          {currentLanguage.flag}
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.code}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg z-50">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {t('languageSelector.title')}
            </p>
            <ul role="listbox" className="space-y-1">
              {languages.map((language) => (
                <li key={language.code}>
                  <button
                    onClick={() => handleLanguageChange(language.code)}
                    role="option"
                    aria-selected={locale === language.code}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                      locale === language.code
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-2xl" role="img" aria-label={language.name}>
                      {language.flag}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{language.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {language.code}
                      </p>
                    </div>
                    {locale === language.code && (
                      <svg
                        className="w-5 h-5 text-primary-600 dark:text-primary-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
