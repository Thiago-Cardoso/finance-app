'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

export type Locale = 'pt-BR' | 'en-US'

type CurrencyConfig = {
  symbol: string
  code: string
  format: string
}

type TranslationValue = string | { [key: string]: TranslationValue }

type TranslationData = {
  [key: string]: TranslationValue
  currency: CurrencyConfig
}

type Translations = Record<Locale, TranslationData>

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  formatCurrency: (amount: number) => string
  formatDate: (date: Date | string) => string
}

const defaultTranslations: Translations = {
  'pt-BR': {
    currency: { symbol: 'R$', code: 'BRL', format: '{symbol} {value}' },
    common: {
      loading: 'Carregando...',
      error: 'Erro'
    }
  },
  'en-US': {
    currency: { symbol: '$', code: 'USD', format: '{symbol} {value}' },
    common: {
      loading: 'Loading...',
      error: 'Error'
    }
  }
}

let translations = { ...defaultTranslations }

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// Load translations on the client side only
if (typeof window !== 'undefined') {
  Promise.all([
    import('@/locales/pt-BR.json'),
    import('@/locales/en-US.json')
  ]).then(([ptBR, enUS]) => {
    translations = {
      'pt-BR': {
        ...defaultTranslations['pt-BR'],
        ...ptBR.default
      },
      'en-US': {
        ...defaultTranslations['en-US'],
        ...enUS.default
      }
    }
  }).catch(error => {
    console.error('Error loading translations:', error)
  })
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pt-BR')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      try {
        const savedLocale = localStorage.getItem('locale') as Locale | null
        if (savedLocale && ['pt-BR', 'en-US'].includes(savedLocale)) {
          setLocaleState(savedLocale)
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error)
      }
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('locale', newLocale)
        document.documentElement.lang = newLocale
      } catch (error) {
        console.error('Error saving locale to localStorage:', error)
      }
    }
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: TranslationValue | undefined = translations[locale]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    if (params) {
      return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
        return result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      }, value)
    }

    return value
  }, [locale])

  const formatCurrency = useCallback((amount: number): string => {
    const currencyConfig = translations[locale].currency
    const { symbol = 'R$' } = currencyConfig

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

  // Always render children, just mark as not mounted for initial render
  return (
    <LocaleContext.Provider value={{
      locale,
      setLocale,
      t,
      formatCurrency,
      formatDate
    }}>
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
