---
status: pending
parallelizable: false
blocked_by: ["18.0", "19.0", "23.0", "24.0", "25.0"]
---

<task_context>
<domain>fullstack/optimization</domain>
<type>optimization</type>
<scope>performance</scope>
<complexity>high</complexity>
<dependencies>analytics, reports, dashboard, import, goals</dependencies>
<unblocks>"30.0"</unblocks>
</task_context>

# Tarefa 26.0: Otimização de Performance e Escalabilidade

## Visão Geral
Implementar otimizações abrangentes de performance em todo o sistema, incluindo otimização de queries, cache inteligente, lazy loading, compressão de assets, monitoramento de performance e preparação para escalabilidade.

## Requisitos
- Otimização de queries do banco de dados
- Sistema de cache multi-camadas
- Lazy loading e code splitting no frontend
- Compressão e otimização de assets
- Monitoramento de performance em tempo real
- Indexação avançada no banco
- Rate limiting e throttling
- Otimização de imagens
- Service workers e PWA
- Preparação para scaling horizontal

## Subtarefas
- [ ] 26.1 Análise e otimização de queries do banco
- [ ] 26.2 Sistema de cache Redis multi-camadas
- [ ] 26.3 Lazy loading e code splitting frontend
- [ ] 26.4 Otimização de assets e compressão
- [ ] 26.5 Implementação de CDN
- [ ] 26.6 Monitoramento de performance (APM)
- [ ] 26.7 Rate limiting e throttling
- [ ] 26.8 Service workers e PWA features
- [ ] 26.9 Otimização de imagens
- [ ] 26.10 Preparação para scaling

## Sequenciamento
- Bloqueado por: 18.0 (Analytics), 19.0 (Relatórios), 23.0 (Dashboard), 24.0 (Import), 25.0 (Metas)
- Desbloqueia: 30.0 (Deploy Produção)
- Paralelizável: Não (requer sistema completo funcionando)

## Detalhes de Implementação

### 1. Otimização de Queries do Banco
```ruby
# config/application.rb
module FinanceApp
  class Application < Rails::Application
    # Enable query optimization logging
    config.active_record.verbose_query_logs = true if Rails.env.development?

    # Configure query analysis
    config.active_record.warn_on_records_fetched_greater_than = 1000
    config.active_record.query_log_tags_enabled = true
  end
end

# app/models/concerns/query_optimizable.rb
module QueryOptimizable
  extend ActiveSupport::Concern

  included do
    # Add query optimization methods
    scope :with_includes, ->(includes) { includes(includes) if includes.present? }
    scope :with_preload, ->(preload) { preload(preload) if preload.present? }
    scope :with_eager_load, ->(eager_load) { eager_load(eager_load) if eager_load.present? }
  end

  class_methods do
    def optimized_find_by_user(user_id, includes: nil)
      query = where(user_id: user_id)
      query = query.includes(includes) if includes.present?
      query
    end

    def with_pagination(page = 1, per_page = 20)
      page(page).per(per_page)
    end
  end
end

# app/models/transaction.rb
class Transaction < ApplicationRecord
  include QueryOptimizable

  # Optimized scopes
  scope :recent_with_category, -> {
    includes(:category)
      .order(date: :desc, created_at: :desc)
      .limit(100)
  }

  scope :monthly_summary, ->(year, month) {
    select('transaction_type, categories.name as category_name, SUM(amount) as total_amount, COUNT(*) as count')
      .joins(:category)
      .where(date: Date.new(year, month).beginning_of_month..Date.new(year, month).end_of_month)
      .group(:transaction_type, 'categories.name')
  }

  scope :category_totals, ->(start_date, end_date) {
    select('categories.id, categories.name, categories.color, SUM(amount) as total_amount')
      .joins(:category)
      .where(date: start_date..end_date)
      .group('categories.id, categories.name, categories.color')
      .order('total_amount DESC')
  }

  # Optimized class methods
  def self.dashboard_data(user_id, start_date, end_date)
    Rails.cache.fetch("dashboard_data_#{user_id}_#{start_date}_#{end_date}", expires_in: 15.minutes) do
      {
        summary: where(user_id: user_id, date: start_date..end_date)
                  .group(:transaction_type)
                  .sum(:amount),
        recent_transactions: where(user_id: user_id)
                            .includes(:category)
                            .recent_with_category
                            .limit(5),
        category_breakdown: where(user_id: user_id, date: start_date..end_date)
                           .category_totals(start_date, end_date)
                           .limit(10)
      }
    end
  end
end

# app/services/query_optimizer_service.rb
class QueryOptimizerService
  include ActiveModel::Model

  def self.analyze_slow_queries
    # Analyze slow query log and suggest optimizations
    slow_queries = Rails.cache.fetch('slow_queries_analysis', expires_in: 1.hour) do
      analyze_query_performance
    end

    generate_optimization_report(slow_queries)
  end

  private

  def self.analyze_query_performance
    # This would integrate with pg_stat_statements or similar
    {
      slow_queries: [],
      missing_indexes: [],
      n_plus_one_queries: []
    }
  end

  def self.generate_optimization_report(data)
    {
      recommendations: [
        'Add index on transactions(user_id, date)',
        'Consider partitioning transactions table by date',
        'Add composite index on (user_id, category_id, date)'
      ],
      performance_score: calculate_performance_score(data)
    }
  end

  def self.calculate_performance_score(data)
    # Calculate based on query performance metrics
    base_score = 100
    base_score -= data[:slow_queries].count * 5
    base_score -= data[:missing_indexes].count * 10
    [base_score, 0].max
  end
end
```

### 2. Sistema de Cache Redis Multi-camadas
```ruby
# config/environments/production.rb
Rails.application.configure do
  # Redis cache store
  config.cache_store = :redis_cache_store, {
    url: ENV['REDIS_URL'],
    pool_size: ENV.fetch('RAILS_MAX_THREADS', 5),
    pool_timeout: 5,

    # Cache optimization
    compress: true,
    compression_threshold: 1024,

    # Namespace
    namespace: 'finance_app_cache'
  }
end

# app/services/cache_service.rb
class CacheService
  include ActiveModel::Model

  CACHE_VERSIONS = {
    user_dashboard: 'v2',
    financial_summary: 'v3',
    budget_performance: 'v2',
    transaction_data: 'v1'
  }.freeze

  class << self
    def fetch_dashboard_data(user_id, start_date, end_date)
      cache_key = dashboard_cache_key(user_id, start_date, end_date)

      Rails.cache.fetch(cache_key, expires_in: 15.minutes) do
        generate_dashboard_data(user_id, start_date, end_date)
      end
    end

    def fetch_financial_summary(user_id, filters)
      cache_key = financial_summary_cache_key(user_id, filters)

      Rails.cache.fetch(cache_key, expires_in: 30.minutes) do
        Reports::FinancialSummaryGenerator.new(
          user: User.find(user_id),
          start_date: filters[:start_date],
          end_date: filters[:end_date],
          filters: filters
        ).call
      end
    end

    def invalidate_user_cache(user_id)
      pattern = "*user_#{user_id}*"
      Rails.cache.delete_matched(pattern)
    end

    def invalidate_dashboard_cache(user_id)
      pattern = "*dashboard_#{user_id}*"
      Rails.cache.delete_matched(pattern)
    end

    def cache_stats
      Rails.cache.stats
    end

    def warm_cache_for_user(user_id)
      # Pre-populate common cache keys
      user = User.find(user_id)

      # Dashboard data
      fetch_dashboard_data(user_id, 30.days.ago, Date.current)

      # Financial summary
      fetch_financial_summary(user_id, {
        start_date: Date.current.beginning_of_month,
        end_date: Date.current,
        category_ids: [],
        transaction_type: nil
      })

      # Budget performance
      BudgetPerformanceService.new(user).call
    end

    private

    def dashboard_cache_key(user_id, start_date, end_date)
      "#{CACHE_VERSIONS[:user_dashboard]}/dashboard_#{user_id}_#{start_date}_#{end_date}"
    end

    def financial_summary_cache_key(user_id, filters)
      filter_hash = Digest::MD5.hexdigest(filters.to_json)
      "#{CACHE_VERSIONS[:financial_summary]}/financial_summary_#{user_id}_#{filter_hash}"
    end

    def generate_dashboard_data(user_id, start_date, end_date)
      user = User.find(user_id)

      {
        summary: user.transactions.where(date: start_date..end_date)
                    .group(:transaction_type)
                    .sum(:amount),
        recent_transactions: user.transactions.includes(:category)
                                .order(date: :desc)
                                .limit(10),
        budget_status: user.budgets.active.map(&:status_summary),
        goal_progress: user.goals.active.map(&:progress_percentage)
      }
    end
  end
end

# app/jobs/cache_warming_job.rb
class CacheWarmingJob < ApplicationJob
  queue_as :low_priority

  def perform(user_id = nil)
    if user_id
      CacheService.warm_cache_for_user(user_id)
    else
      # Warm cache for active users
      User.where('last_sign_in_at > ?', 7.days.ago).find_each do |user|
        CacheService.warm_cache_for_user(user.id)
      end
    end
  end
end
```

### 3. Lazy Loading e Code Splitting Frontend
```tsx
// src/lib/lazyLoad.tsx
import { lazy, Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface LazyComponentProps {
  fallback?: React.ComponentType
  errorFallback?: React.ComponentType<{ error: Error }>
}

export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentProps = {}
) {
  const LazyComponent = lazy(importFn)

  return function LazyWrapper(props: React.ComponentProps<T>) {
    const FallbackComponent = options.fallback || DefaultFallback
    const ErrorFallback = options.errorFallback || DefaultErrorFallback

    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<FallbackComponent />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-medium text-red-900 mb-2">
        Erro ao carregar componente
      </h3>
      <p className="text-red-600 text-sm">{error.message}</p>
    </div>
  )
}

// src/components/LazyComponents.tsx
// Lazy loaded page components
export const DashboardPage = createLazyComponent(
  () => import('@/app/dashboard/page'),
  {
    fallback: () => <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />
  }
)

export const TransactionsPage = createLazyComponent(
  () => import('@/app/transactions/page')
)

export const BudgetsPage = createLazyComponent(
  () => import('@/app/budgets/page')
)

export const ReportsPage = createLazyComponent(
  () => import('@/app/reports/page')
)

export const ImportPage = createLazyComponent(
  () => import('@/app/import/page')
)

// Lazy loaded chart components
export const FinancialSummaryDashboard = createLazyComponent(
  () => import('@/components/reports/FinancialSummaryDashboard/FinancialSummaryDashboard')
)

export const BudgetPerformanceDashboard = createLazyComponent(
  () => import('@/components/reports/BudgetPerformanceDashboard/BudgetPerformanceDashboard')
)
```

### 4. Hook para Performance Monitoring
```tsx
// src/hooks/usePerformanceMonitor.ts
'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  mountTime: number
  updateCount: number
}

export function usePerformanceMonitor(componentName: string) {
  const mountTime = useRef<number>(0)
  const renderTime = useRef<number>(0)
  const updateCount = useRef<number>(0)
  const lastRenderTime = useRef<number>(0)

  // Monitor component mount
  useEffect(() => {
    mountTime.current = performance.now()

    return () => {
      // Component unmount - send metrics
      const metrics: PerformanceMetrics = {
        componentName,
        renderTime: renderTime.current,
        mountTime: mountTime.current,
        updateCount: updateCount.current
      }

      sendPerformanceMetrics(metrics)
    }
  }, [componentName])

  // Monitor renders
  useEffect(() => {
    const currentTime = performance.now()

    if (lastRenderTime.current > 0) {
      renderTime.current = currentTime - lastRenderTime.current
      updateCount.current += 1
    }

    lastRenderTime.current = currentTime
  })

  const measureAsync = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now()

    try {
      const result = await operation()
      const endTime = performance.now()

      // Send async operation metrics
      sendAsyncMetrics({
        componentName,
        operationName,
        duration: endTime - startTime,
        success: true
      })

      return result
    } catch (error) {
      const endTime = performance.now()

      sendAsyncMetrics({
        componentName,
        operationName,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }, [componentName])

  return { measureAsync }
}

function sendPerformanceMetrics(metrics: PerformanceMetrics) {
  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'component_performance', {
      component_name: metrics.componentName,
      render_time: metrics.renderTime,
      mount_time: metrics.mountTime,
      update_count: metrics.updateCount
    })
  }
}

function sendAsyncMetrics(metrics: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'async_operation_performance', metrics)
  }
}
```

### 5. Otimização de Assets
```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression
  compress: true,

  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimization
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }

    // Compression
    if (!dev) {
      config.plugins.push(
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 50,
        })
      )
    }

    return config
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Output file tracing
  output: 'standalone',

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)

// src/lib/imageOptimization.ts
export function getOptimizedImageProps(
  src: string,
  alt: string,
  width?: number,
  height?: number
) {
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy' as const,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==',
    quality: 75,
    sizes: width && height
      ? `(max-width: 768px) ${Math.round(width * 0.5)}px, ${width}px`
      : '(max-width: 768px) 100vw, 50vw'
  }
}
```

### 6. Rate Limiting Backend
```ruby
# config/application.rb
require 'rack/attack'

class Application < Rails::Application
  config.middleware.use Rack::Attack
end

# config/initializers/rack_attack.rb
class Rack::Attack
  # Configure Redis store
  Rack::Attack.cache.store = ActiveSupport::Cache::RedisCacheStore.new(
    url: ENV['REDIS_URL'],
    namespace: 'finance_app_rate_limit'
  )

  # Throttle general requests by IP
  throttle('general_requests_by_ip', limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Throttle API requests by IP
  throttle('api_requests_by_ip', limit: 100, period: 1.minute) do |req|
    req.ip if req.path.start_with?('/api/')
  end

  # Throttle login attempts
  throttle('login_attempts_by_ip', limit: 5, period: 20.minutes) do |req|
    req.ip if req.path == '/api/v1/auth/sign_in' && req.post?
  end

  # Throttle password reset attempts
  throttle('password_reset_by_ip', limit: 3, period: 1.hour) do |req|
    req.ip if req.path == '/api/v1/auth/password' && req.post?
  end

  # Throttle authenticated API requests by user
  throttle('api_requests_by_user', limit: 1000, period: 1.hour) do |req|
    if req.path.start_with?('/api/') && req.env['warden']&.user
      req.env['warden'].user.id
    end
  end

  # Block IP addresses that make too many requests
  blocklist('block_bad_ips') do |req|
    # Block if more than 20 requests per minute
    Rack::Attack::Allow2Ban.filter(req.ip, maxretry: 20, findtime: 1.minute, bantime: 10.minutes) do
      # The count for the IP is over the limit
      Rails.logger.warn "Rack::Attack: Blocking IP #{req.ip}"
      true
    end
  end

  # Custom response for throttled requests
  self.throttled_response = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s
      },
      [{
        success: false,
        message: 'Rate limit exceeded. Please try again later.',
        retry_after: retry_after
      }.to_json]
    ]
  end

  # Custom response for blocked requests
  self.blocklisted_response = lambda do |env|
    [
      403,
      { 'Content-Type' => 'application/json' },
      [{
        success: false,
        message: 'Access denied. IP address has been blocked due to suspicious activity.'
      }.to_json]
    ]
  end
end

# Add tracking
ActiveSupport::Notifications.subscribe('rack.attack') do |name, start, finish, request_id, payload|
  Rails.logger.info "Rack::Attack: #{payload[:request].env['rack.attack.match_type']} #{payload[:request].ip} #{payload[:request].path}"
end
```

### 7. Service Workers e PWA
```typescript
// public/sw.js
const CACHE_NAME = 'finance-app-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
})

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response
        }

        // Clone the request
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        })
      })
  )
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Sync pending transactions when online
  try {
    const pendingData = await getStoredData('pending_transactions')

    for (const transaction of pendingData) {
      await fetch('/api/v1/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    // Clear pending data after successful sync
    await clearStoredData('pending_transactions')
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// src/lib/pwa.ts
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

export function enableOfflineMode() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    // Register for background sync
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register('background-sync')
    })
  }
}
```

### 8. Monitoramento de Performance
```ruby
# app/middleware/performance_monitor.rb
class PerformanceMonitor
  def initialize(app)
    @app = app
  end

  def call(env)
    start_time = Time.current

    status, headers, body = @app.call(env)

    end_time = Time.current
    duration = ((end_time - start_time) * 1000).round(2)

    # Log slow requests
    if duration > 1000 # 1 second
      Rails.logger.warn "Slow request: #{env['REQUEST_METHOD']} #{env['PATH_INFO']} - #{duration}ms"
    end

    # Add performance headers
    headers['X-Response-Time'] = "#{duration}ms"
    headers['X-Request-Id'] = env['action_dispatch.request_id']

    # Send metrics to monitoring service
    send_performance_metrics(env, duration, status) if Rails.env.production?

    [status, headers, body]
  end

  private

  def send_performance_metrics(env, duration, status)
    # Send to APM service (New Relic, DataDog, etc.)
    Thread.new do
      begin
        metric_data = {
          path: env['PATH_INFO'],
          method: env['REQUEST_METHOD'],
          duration: duration,
          status: status,
          timestamp: Time.current.to_i
        }

        # Example: Send to external monitoring service
        # MonitoringService.send_metric(metric_data)
      rescue => e
        Rails.logger.error "Failed to send performance metrics: #{e.message}"
      end
    end
  end
end

# app/services/performance_analyzer_service.rb
class PerformanceAnalyzerService
  include ActiveModel::Model

  def self.analyze_application_performance
    {
      database_performance: analyze_database_performance,
      memory_usage: analyze_memory_usage,
      response_times: analyze_response_times,
      error_rates: analyze_error_rates,
      recommendations: generate_recommendations
    }
  end

  private

  def self.analyze_database_performance
    {
      average_query_time: calculate_average_query_time,
      slow_queries_count: count_slow_queries,
      connection_pool_usage: analyze_connection_pool
    }
  end

  def self.analyze_memory_usage
    {
      current_usage: GC.stat[:heap_live_slots],
      peak_usage: GC.stat[:heap_allocated_pages],
      gc_runs: GC.stat[:count]
    }
  end

  def self.analyze_response_times
    # Analyze response times from logs or APM
    {
      p50: 150,
      p95: 800,
      p99: 1200
    }
  end

  def self.analyze_error_rates
    # Calculate error rates
    {
      error_rate_percentage: 0.5,
      most_common_errors: ['TimeoutError', 'ConnectionError']
    }
  end

  def self.generate_recommendations
    recommendations = []

    # Database recommendations
    if count_slow_queries > 10
      recommendations << 'Consider adding database indexes for slow queries'
    end

    # Memory recommendations
    if GC.stat[:heap_live_slots] > 1000000
      recommendations << 'Memory usage is high, consider optimizing object allocation'
    end

    recommendations
  end

  def self.calculate_average_query_time
    # This would integrate with actual database monitoring
    25.5 # milliseconds
  end

  def self.count_slow_queries
    # Count queries taking more than 100ms
    5
  end

  def self.analyze_connection_pool
    ActiveRecord::Base.connection_pool.stat
  end
end
```

### 9. Testes de Performance
```ruby
# spec/performance/api_performance_spec.rb
require 'rails_helper'

RSpec.describe 'API Performance', type: :request do
  let(:user) { create(:user) }
  let!(:transactions) { create_list(:transaction, 100, user: user) }
  let!(:budgets) { create_list(:budget, 10, user: user) }

  before do
    sign_in user
  end

  describe 'GET /api/v1/transactions' do
    it 'responds within acceptable time limit' do
      expect {
        get '/api/v1/transactions'
      }.to perform_under(200.ms)

      expect(response).to have_http_status(:success)
    end

    it 'handles large datasets efficiently' do
      create_list(:transaction, 1000, user: user)

      expect {
        get '/api/v1/transactions', params: { per_page: 50 }
      }.to perform_under(300.ms)
    end
  end

  describe 'GET /api/v1/dashboard' do
    it 'loads dashboard data efficiently' do
      expect {
        get '/api/v1/dashboard'
      }.to perform_under(500.ms)

      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /api/v1/transactions' do
    it 'creates transactions efficiently' do
      transaction_params = {
        description: 'Test transaction',
        amount: 100.0,
        transaction_type: 'expense',
        date: Date.current
      }

      expect {
        post '/api/v1/transactions', params: { transaction: transaction_params }
      }.to perform_under(150.ms)

      expect(response).to have_http_status(:created)
    end
  end
end

# spec/support/performance_helpers.rb
RSpec.configure do |config|
  config.include(Module.new do
    def perform_under(time_limit)
      PerformanceMatcher.new(time_limit)
    end
  end)
end

class PerformanceMatcher
  def initialize(time_limit)
    @time_limit = time_limit
  end

  def matches?(block)
    start_time = Time.current
    block.call
    end_time = Time.current

    @actual_time = ((end_time - start_time) * 1000).round(2)
    @actual_time <= @time_limit.to_f
  end

  def failure_message
    "Expected block to execute under #{@time_limit}ms, but took #{@actual_time}ms"
  end

  def failure_message_when_negated
    "Expected block to execute over #{@time_limit}ms, but took #{@actual_time}ms"
  end
end
```

## Critérios de Sucesso
- [ ] Queries do banco otimizadas com índices apropriados
- [ ] Sistema de cache Redis implementado e funcionando
- [ ] Lazy loading e code splitting no frontend
- [ ] Assets otimizados e comprimidos
- [ ] CDN configurado e funcionando
- [ ] Monitoramento de performance implementado
- [ ] Rate limiting configurado
- [ ] Service workers e PWA features
- [ ] Tempo de resposta API < 200ms (p95)
- [ ] Lighthouse score > 90

## Métricas de Performance
- Tempo de carregamento inicial < 3s
- Tempo de resposta API < 200ms (p95)
- Lighthouse Performance Score > 90
- Core Web Vitals otimizados
- Bundle size < 500KB (gzipped)

## Recursos Necessários
- Desenvolvedor full-stack sênior
- DevOps para configuração de CDN e monitoramento
- Tester para validação de performance

## Tempo Estimado
- Análise e otimização de queries: 8-10 horas
- Sistema de cache: 8-10 horas
- Lazy loading e code splitting: 6-8 horas
- Otimização de assets: 6-8 horas
- Monitoramento e APM: 8-10 horas
- Rate limiting e segurança: 6-8 horas
- PWA e service workers: 8-10 horas
- Testes de performance: 6-8 horas
- **Total**: 8-10 dias de trabalho