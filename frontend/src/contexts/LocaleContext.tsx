'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export type Locale = 'pt-BR' | 'en-US'

type TranslationObject = {
  [key: string]: string | TranslationObject
}

type Translations = {
  [key in Locale]: TranslationObject
}

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const translations: Translations = {
  'pt-BR': require('@/locales/pt-BR.json'),
  'en-US': require('@/locales/en-US.json')
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved locale from localStorage
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale | null
      if (savedLocale && ['pt-BR', 'en-US'].includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale)
      document.documentElement.lang = newLocale
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[locale]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters in the translation
    if (params) {
      return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
        return result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      }, value)
    }

    return value
  }, [locale])

  const formatCurrency = useCallback((amount: number): string => {
    const currencyConfig = translations[locale].currency as any
    const symbol = currencyConfig?.symbol || 'R$'
    const formattedAmount = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount))

    return `${symbol} ${formattedAmount}`
  }, [locale])

  const formatDate = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj)
  }, [locale])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const value: LocaleContextType = {
    locale,
    setLocale,
    t,
    formatCurrency,
    formatDate
  }

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }
  return context
}
