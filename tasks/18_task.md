---
status: pending
parallelizable: false
blocked_by: ["2.0", "12.0", "17.0"]
---

<task_context>
<domain>backend/analytics</domain>
<type>implementation</type>
<scope>core_feature</scope>
<complexity>high</complexity>
<dependencies>backend_setup, filters, budgets</dependencies>
<unblocks>"19.0", "23.0", "26.0"</unblocks>
</task_context>

# Tarefa 18.0: Sistema de Relatórios e Analytics (Backend)

## Visão Geral
Implementar sistema completo de relatórios financeiros e analytics no backend Rails, incluindo relatórios pré-definidos, analytics personalizados, comparações temporais e exportação de dados em múltiplos formatos.

## Requisitos
- Relatórios financeiros pré-definidos
- Analytics personalizados por período
- Comparações temporais (MoM, YoY)
- Análise de tendências e padrões
- Relatórios de categorias e orçamentos
- Exportação em PDF, Excel, CSV
- API para dashboard de analytics
- Cache inteligente para performance
- Suporte a filtros avançados
- Métricas estatísticas detalhadas

## Subtarefas
- [ ] 18.1 Modelos para relatórios e analytics
- [ ] 18.2 Services para geração de relatórios
- [ ] 18.3 Analytics de transações e categorias
- [ ] 18.4 Comparações temporais e tendências
- [ ] 18.5 Relatórios de orçamentos e metas
- [ ] 18.6 Sistema de exportação de dados
- [ ] 18.7 API endpoints para analytics
- [ ] 18.8 Cache e otimização de performance
- [ ] 18.9 Validações e sanitização
- [ ] 18.10 Testes unitários e de integração

## Sequenciamento
- Bloqueado por: 2.0 (Backend Setup), 12.0 (Filtros), 17.0 (Orçamentos)
- Desbloqueia: 19.0 (Interface Relatórios), 23.0 (Dashboard Avançado), 26.0 (Performance)
- Paralelizável: Não (depende de filtros e orçamentos)

## Detalhes de Implementação

### 1. Modelo Report
```ruby
# app/models/report.rb
class Report < ApplicationRecord
  belongs_to :user
  has_many :report_schedules, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :report_type, presence: true, inclusion: { in: %w[financial_summary expense_breakdown income_analysis budget_performance category_analysis monthly_comparison yearly_overview cash_flow custom] }
  validates :period_type, presence: true, inclusion: { in: %w[daily weekly monthly quarterly yearly custom] }

  enum status: { draft: 0, active: 1, archived: 2 }
  enum report_type: {
    financial_summary: 0,
    expense_breakdown: 1,
    income_analysis: 2,
    budget_performance: 3,
    category_analysis: 4,
    monthly_comparison: 5,
    yearly_overview: 6,
    cash_flow: 7,
    custom: 8
  }
  enum period_type: { daily: 0, weekly: 1, monthly: 2, quarterly: 3, yearly: 4, custom: 5 }

  scope :active, -> { where(status: :active) }
  scope :by_type, ->(type) { where(report_type: type) }

  def generate_data(start_date: nil, end_date: nil, filters: {})
    generator = "Reports::#{report_type.camelize}Generator".constantize
    generator.new(
      user: user,
      start_date: start_date || default_start_date,
      end_date: end_date || default_end_date,
      filters: filters.merge(filter_criteria || {})
    ).call
  end

  def export(format = 'pdf', options = {})
    data = generate_data(options)
    exporter = "Reports::#{format.upcase}Exporter".constantize
    exporter.new(self, data, options).call
  end

  private

  def default_start_date
    case period_type
    when 'daily'
      Date.current
    when 'weekly'
      Date.current.beginning_of_week
    when 'monthly'
      Date.current.beginning_of_month
    when 'quarterly'
      Date.current.beginning_of_quarter
    when 'yearly'
      Date.current.beginning_of_year
    else
      1.month.ago
    end
  end

  def default_end_date
    case period_type
    when 'daily'
      Date.current
    when 'weekly'
      Date.current.end_of_week
    when 'monthly'
      Date.current.end_of_month
    when 'quarterly'
      Date.current.end_of_quarter
    when 'yearly'
      Date.current.end_of_year
    else
      Date.current
    end
  end
end
```

### 2. Service Base para Relatórios
```ruby
# app/services/reports/base_generator.rb
module Reports
  class BaseGenerator
    include ActiveModel::Model

    attr_accessor :user, :start_date, :end_date, :filters

    def initialize(user:, start_date:, end_date:, filters: {})
      @user = user
      @start_date = start_date
      @end_date = end_date
      @filters = filters
    end

    def call
      raise NotImplementedError, 'Subclasses must implement call method'
    end

    protected

    def base_transactions
      user.transactions
          .includes(:category)
          .where(date: start_date..end_date)
    end

    def filtered_transactions
      transactions = base_transactions

      if filters[:category_ids].present?
        transactions = transactions.where(category_id: filters[:category_ids])
      end

      if filters[:transaction_type].present?
        transactions = transactions.where(transaction_type: filters[:transaction_type])
      end

      if filters[:min_amount].present?
        transactions = transactions.where('amount >= ?', filters[:min_amount])
      end

      if filters[:max_amount].present?
        transactions = transactions.where('amount <= ?', filters[:max_amount])
      end

      transactions
    end

    def calculate_totals(transactions)
      {
        total_income: transactions.income.sum(:amount),
        total_expense: transactions.expense.sum(:amount),
        net_amount: transactions.income.sum(:amount) - transactions.expense.sum(:amount),
        transaction_count: transactions.count,
        avg_income: transactions.income.average(:amount) || 0,
        avg_expense: transactions.expense.average(:amount) || 0
      }
    end

    def group_by_period(transactions, period = :month)
      case period
      when :day
        transactions.group_by_day(:date).sum(:amount)
      when :week
        transactions.group_by_week(:date).sum(:amount)
      when :month
        transactions.group_by_month(:date).sum(:amount)
      when :quarter
        transactions.group_by_quarter(:date).sum(:amount)
      when :year
        transactions.group_by_year(:date).sum(:amount)
      end
    end

    def calculate_growth_rate(current, previous)
      return 0 if previous == 0
      ((current - previous) / previous * 100).round(2)
    end

    def format_currency(amount)
      "R$ #{amount.to_f.round(2)}"
    end

    def cache_key
      "report_#{user.id}_#{self.class.name.demodulize.underscore}_#{start_date}_#{end_date}_#{Digest::MD5.hexdigest(filters.to_s)}"
    end
  end
end
```

### 3. Relatório de Resumo Financeiro
```ruby
# app/services/reports/financial_summary_generator.rb
module Reports
  class FinancialSummaryGenerator < BaseGenerator
    def call
      Rails.cache.fetch(cache_key, expires_in: 1.hour) do
        generate_financial_summary
      end
    end

    private

    def generate_financial_summary
      transactions = filtered_transactions
      current_totals = calculate_totals(transactions)

      # Previous period comparison
      previous_period_start = start_date - (end_date - start_date + 1)
      previous_period_end = start_date - 1
      previous_transactions = user.transactions
                                 .where(date: previous_period_start..previous_period_end)
      previous_totals = calculate_totals(previous_transactions)

      # Monthly breakdown
      monthly_data = generate_monthly_breakdown(transactions)

      # Category breakdown
      category_breakdown = generate_category_breakdown(transactions)

      # Top transactions
      top_expenses = transactions.expense.order(amount: :desc).limit(5)
      top_incomes = transactions.income.order(amount: :desc).limit(5)

      {
        summary: {
          period: {
            start_date: start_date,
            end_date: end_date,
            days_count: (end_date - start_date).to_i + 1
          },
          current_period: current_totals,
          previous_period: previous_totals,
          growth_rates: {
            income_growth: calculate_growth_rate(current_totals[:total_income], previous_totals[:total_income]),
            expense_growth: calculate_growth_rate(current_totals[:total_expense], previous_totals[:total_expense]),
            net_growth: calculate_growth_rate(current_totals[:net_amount], previous_totals[:net_amount])
          }
        },
        monthly_breakdown: monthly_data,
        category_breakdown: category_breakdown,
        top_transactions: {
          expenses: ActiveModelSerializers::SerializableResource.new(
            top_expenses,
            each_serializer: TransactionSerializer
          ),
          incomes: ActiveModelSerializers::SerializableResource.new(
            top_incomes,
            each_serializer: TransactionSerializer
          )
        },
        insights: generate_insights(current_totals, previous_totals, category_breakdown),
        generated_at: Time.current
      }
    end

    def generate_monthly_breakdown(transactions)
      months = group_by_period(transactions.income, :month).merge(
        group_by_period(transactions.expense, :month)
      ) { |month, income, expense| { income: income, expense: expense } }

      months.map do |month, data|
        {
          month: month.strftime('%Y-%m'),
          month_name: I18n.l(month, format: '%B %Y'),
          income: data[:income] || 0,
          expense: data[:expense] || 0,
          net: (data[:income] || 0) - (data[:expense] || 0)
        }
      end.sort_by { |item| item[:month] }
    end

    def generate_category_breakdown(transactions)
      expenses_by_category = transactions.expense
                                       .joins(:category)
                                       .group('categories.name', 'categories.color')
                                       .sum(:amount)

      total_expenses = transactions.expense.sum(:amount)

      expenses_by_category.map do |(name, color), amount|
        percentage = total_expenses > 0 ? (amount / total_expenses * 100).round(2) : 0
        {
          category_name: name,
          color: color,
          amount: amount,
          percentage: percentage,
          transaction_count: transactions.expense.joins(:category).where('categories.name = ?', name).count
        }
      end.sort_by { |item| -item[:amount] }
    end

    def generate_insights(current, previous, categories)
      insights = []

      # Spending pattern insights
      if current[:total_expense] > previous[:total_expense]
        increase = current[:total_expense] - previous[:total_expense]
        percentage = calculate_growth_rate(current[:total_expense], previous[:total_expense])
        insights << {
          type: 'warning',
          title: 'Aumento nos Gastos',
          message: "Seus gastos aumentaram #{format_currency(increase)} (#{percentage}%) em relação ao período anterior.",
          action: 'Revise suas categorias de maior gasto'
        }
      end

      # Income growth
      if current[:total_income] > previous[:total_income]
        increase = current[:total_income] - previous[:total_income]
        percentage = calculate_growth_rate(current[:total_income], previous[:total_income])
        insights << {
          type: 'success',
          title: 'Crescimento na Renda',
          message: "Sua renda aumentou #{format_currency(increase)} (#{percentage}%) em relação ao período anterior.",
          action: 'Considere aumentar seus investimentos'
        }
      end

      # Top category insight
      if categories.any?
        top_category = categories.first
        insights << {
          type: 'info',
          title: 'Categoria Principal',
          message: "#{top_category[:category_name]} representa #{top_category[:percentage]}% dos seus gastos.",
          action: 'Considere criar um orçamento específico para esta categoria'
        }
      end

      # Savings rate
      savings_rate = current[:total_income] > 0 ?
        ((current[:total_income] - current[:total_expense]) / current[:total_income] * 100).round(2) : 0

      if savings_rate < 20
        insights << {
          type: 'warning',
          title: 'Taxa de Poupança Baixa',
          message: "Sua taxa de poupança é de #{savings_rate}%. Especialistas recomendam pelo menos 20%.",
          action: 'Revise seus gastos e identifique onde pode economizar'
        }
      elsif savings_rate >= 30
        insights << {
          type: 'success',
          title: 'Excelente Taxa de Poupança',
          message: "Parabéns! Sua taxa de poupança de #{savings_rate}% está acima da média.",
          action: 'Continue mantendo este bom hábito financeiro'
        }
      end

      insights
    end
  end
end
```

### 4. Relatório de Performance de Orçamentos
```ruby
# app/services/reports/budget_performance_generator.rb
module Reports
  class BudgetPerformanceGenerator < BaseGenerator
    def call
      Rails.cache.fetch(cache_key, expires_in: 30.minutes) do
        generate_budget_performance
      end
    end

    private

    def generate_budget_performance
      budgets = user.budgets.active.includes(:category, :budget_periods)

      budget_summaries = budgets.map do |budget|
        analyze_budget_performance(budget)
      end

      overall_performance = calculate_overall_performance(budget_summaries)
      recommendations = generate_recommendations(budget_summaries)

      {
        period: {
          start_date: start_date,
          end_date: end_date
        },
        overall_performance: overall_performance,
        budget_details: budget_summaries,
        recommendations: recommendations,
        trends: analyze_budget_trends(budgets),
        generated_at: Time.current
      }
    end

    def analyze_budget_performance(budget)
      current_period = budget.budget_periods.where(
        'start_date <= ? AND end_date >= ?',
        Date.current,
        Date.current
      ).first

      return budget_summary_without_period(budget) unless current_period

      spent = budget.spent_amount(current_period)
      allocated = current_period.allocated_amount
      usage_percentage = (spent / allocated * 100).round(2)

      days_total = (current_period.end_date - current_period.start_date).to_i + 1
      days_passed = (Date.current - current_period.start_date).to_i + 1
      days_remaining = (current_period.end_date - Date.current).to_i

      # Calculate projected spending
      daily_average = days_passed > 0 ? spent / days_passed : 0
      projected_total = daily_average * days_total

      # Performance score
      performance_score = calculate_performance_score(spent, allocated, days_passed, days_total)

      # Status determination
      status = determine_budget_status(usage_percentage, days_passed, days_total)

      {
        budget_id: budget.id,
        budget_name: budget.name,
        category: budget.category&.name || 'Geral',
        category_color: budget.category&.color,
        allocated_amount: allocated,
        spent_amount: spent,
        remaining_amount: allocated - spent,
        usage_percentage: usage_percentage,
        days_total: days_total,
        days_passed: days_passed,
        days_remaining: [days_remaining, 0].max,
        daily_average: daily_average,
        projected_total: projected_total,
        projected_usage: allocated > 0 ? (projected_total / allocated * 100).round(2) : 0,
        performance_score: performance_score,
        status: status,
        period: {
          start_date: current_period.start_date,
          end_date: current_period.end_date
        }
      }
    end

    def budget_summary_without_period(budget)
      {
        budget_id: budget.id,
        budget_name: budget.name,
        category: budget.category&.name || 'Geral',
        category_color: budget.category&.color,
        allocated_amount: budget.amount,
        spent_amount: 0,
        remaining_amount: budget.amount,
        usage_percentage: 0,
        performance_score: 0,
        status: 'no_period',
        message: 'Nenhum período ativo encontrado'
      }
    end

    def calculate_performance_score(spent, allocated, days_passed, days_total)
      return 100 if allocated == 0

      expected_spent = (allocated * days_passed / days_total)

      if spent <= expected_spent
        # Under or on track - good performance
        variance = (expected_spent - spent) / allocated
        [100 - (variance * 50), 100].min
      else
        # Over budget - poor performance
        variance = (spent - expected_spent) / allocated
        [100 - (variance * 100), 0].max
      end.round(2)
    end

    def determine_budget_status(usage_percentage, days_passed, days_total)
      expected_usage = (days_passed.to_f / days_total * 100).round(2)

      if usage_percentage >= 100
        'over_budget'
      elsif usage_percentage >= 90
        'critical'
      elsif usage_percentage > expected_usage + 15
        'behind_schedule'
      elsif usage_percentage < expected_usage - 15
        'ahead_of_schedule'
      else
        'on_track'
      end
    end

    def calculate_overall_performance(budget_summaries)
      return {} if budget_summaries.empty?

      total_allocated = budget_summaries.sum { |b| b[:allocated_amount] }
      total_spent = budget_summaries.sum { |b| b[:spent_amount] }
      avg_performance = budget_summaries.sum { |b| b[:performance_score] } / budget_summaries.size

      budgets_on_track = budget_summaries.count { |b| ['on_track', 'ahead_of_schedule'].include?(b[:status]) }
      budgets_over = budget_summaries.count { |b| b[:status] == 'over_budget' }

      {
        total_budgets: budget_summaries.size,
        total_allocated: total_allocated,
        total_spent: total_spent,
        overall_usage: total_allocated > 0 ? (total_spent / total_allocated * 100).round(2) : 0,
        average_performance_score: avg_performance.round(2),
        budgets_on_track: budgets_on_track,
        budgets_over_budget: budgets_over,
        success_rate: budget_summaries.size > 0 ? (budgets_on_track.to_f / budget_summaries.size * 100).round(2) : 0
      }
    end

    def generate_recommendations(budget_summaries)
      recommendations = []

      # Over budget recommendations
      over_budget = budget_summaries.select { |b| b[:status] == 'over_budget' }
      if over_budget.any?
        recommendations << {
          type: 'urgent',
          title: 'Orçamentos Estourados',
          message: "#{over_budget.size} orçamento(s) estão acima do limite.",
          actions: [
            'Revisar gastos nas categorias afetadas',
            'Considerar ajustar os valores dos orçamentos',
            'Identificar gastos desnecessários'
          ]
        }
      end

      # Critical budget recommendations
      critical = budget_summaries.select { |b| b[:status] == 'critical' }
      if critical.any?
        recommendations << {
          type: 'warning',
          title: 'Orçamentos Críticos',
          message: "#{critical.size} orçamento(s) estão próximos do limite.",
          actions: [
            'Monitorar gastos mais de perto',
            'Reduzir gastos não essenciais',
            'Considerar realocação de recursos'
          ]
        }
      end

      # Ahead of schedule recommendations
      ahead = budget_summaries.select { |b| b[:status] == 'ahead_of_schedule' }
      if ahead.any?
        recommendations << {
          type: 'success',
          title: 'Oportunidade de Poupança',
          message: "#{ahead.size} orçamento(s) estão abaixo do previsto.",
          actions: [
            'Transferir economia para reserva de emergência',
            'Aumentar investimentos',
            'Antecipar objetivos financeiros'
          ]
        }
      end

      recommendations
    end

    def analyze_budget_trends(budgets)
      # Analyze last 3 months of budget performance
      trends = []

      (-2..0).each do |month_offset|
        month_start = Date.current.beginning_of_month + month_offset.months
        month_end = month_start.end_of_month

        month_performance = budgets.map do |budget|
          periods = budget.budget_periods.where(
            start_date: month_start..month_end
          )

          next unless periods.any?

          period = periods.first
          spent = budget.spent_amount(period)
          allocated = period.allocated_amount

          {
            budget_name: budget.name,
            usage_percentage: allocated > 0 ? (spent / allocated * 100).round(2) : 0
          }
        end.compact

        trends << {
          month: month_start.strftime('%Y-%m'),
          month_name: I18n.l(month_start, format: '%B %Y'),
          budgets: month_performance,
          average_usage: month_performance.any? ?
            (month_performance.sum { |b| b[:usage_percentage] } / month_performance.size).round(2) : 0
        }
      end

      trends
    end
  end
end
```

### 5. Sistema de Exportação
```ruby
# app/services/reports/pdf_exporter.rb
module Reports
  class PDFExporter
    require 'prawn'

    def initialize(report, data, options = {})
      @report = report
      @data = data
      @options = options
    end

    def call
      generate_pdf
    end

    private

    def generate_pdf
      Prawn::Document.new do |pdf|
        # Header
        pdf.text @report.name, size: 20, style: :bold
        pdf.text "Período: #{format_date(@data[:summary][:period][:start_date])} a #{format_date(@data[:summary][:period][:end_date])}", size: 12
        pdf.move_down 20

        # Summary section
        generate_summary_section(pdf)

        # Charts and tables based on report type
        case @report.report_type
        when 'financial_summary'
          generate_financial_summary_content(pdf)
        when 'budget_performance'
          generate_budget_performance_content(pdf)
        end

        # Footer
        pdf.number_pages "Página <page> de <total>", at: [pdf.bounds.right - 150, 0], width: 150, align: :right
      end.render
    end

    def generate_summary_section(pdf)
      summary = @data[:summary] || @data[:overall_performance]
      return unless summary

      pdf.text "Resumo", size: 16, style: :bold
      pdf.move_down 10

      if summary[:current_period]
        # Financial summary
        pdf.text "Receitas: #{format_currency(summary[:current_period][:total_income])}"
        pdf.text "Despesas: #{format_currency(summary[:current_period][:total_expense])}"
        pdf.text "Saldo: #{format_currency(summary[:current_period][:net_amount])}"
      elsif summary[:total_allocated]
        # Budget performance
        pdf.text "Total Orçado: #{format_currency(summary[:total_allocated])}"
        pdf.text "Total Gasto: #{format_currency(summary[:total_spent])}"
        pdf.text "Utilização Geral: #{summary[:overall_usage]}%"
      end

      pdf.move_down 20
    end

    def generate_financial_summary_content(pdf)
      # Category breakdown table
      if @data[:category_breakdown]&.any?
        pdf.text "Gastos por Categoria", size: 14, style: :bold
        pdf.move_down 10

        table_data = [['Categoria', 'Valor', 'Percentual']]
        @data[:category_breakdown].each do |category|
          table_data << [
            category[:category_name],
            format_currency(category[:amount]),
            "#{category[:percentage]}%"
          ]
        end

        pdf.table(table_data, header: true, width: pdf.bounds.width) do
          cells.padding = 8
          row(0).font_style = :bold
        end
      end
    end

    def generate_budget_performance_content(pdf)
      if @data[:budget_details]&.any?
        pdf.text "Performance dos Orçamentos", size: 14, style: :bold
        pdf.move_down 10

        table_data = [['Orçamento', 'Orçado', 'Gasto', 'Utilização', 'Status']]
        @data[:budget_details].each do |budget|
          table_data << [
            budget[:budget_name],
            format_currency(budget[:allocated_amount]),
            format_currency(budget[:spent_amount]),
            "#{budget[:usage_percentage]}%",
            translate_status(budget[:status])
          ]
        end

        pdf.table(table_data, header: true, width: pdf.bounds.width) do
          cells.padding = 8
          row(0).font_style = :bold
        end
      end
    end

    def format_currency(amount)
      "R$ #{amount.to_f.round(2)}"
    end

    def format_date(date)
      date.strftime('%d/%m/%Y')
    end

    def translate_status(status)
      translations = {
        'on_track' => 'No Prazo',
        'over_budget' => 'Estourado',
        'critical' => 'Crítico',
        'ahead_of_schedule' => 'Adiantado',
        'behind_schedule' => 'Atrasado'
      }
      translations[status] || status.humanize
    end
  end
end

# app/services/reports/excel_exporter.rb
module Reports
  class ExcelExporter
    require 'rubyXL'

    def initialize(report, data, options = {})
      @report = report
      @data = data
      @options = options
    end

    def call
      generate_excel
    end

    private

    def generate_excel
      workbook = RubyXL::Workbook.new
      worksheet = workbook[0]
      worksheet.sheet_name = @report.name

      current_row = 0

      # Header
      worksheet.add_cell(current_row, 0, @report.name).change_font_bold(true)
      current_row += 1

      if @data[:summary]
        worksheet.add_cell(current_row, 0, "Período: #{@data[:summary][:period][:start_date]} a #{@data[:summary][:period][:end_date]}")
        current_row += 2
      end

      # Add data based on report type
      case @report.report_type
      when 'financial_summary'
        current_row = add_financial_summary_data(worksheet, current_row)
      when 'budget_performance'
        current_row = add_budget_performance_data(worksheet, current_row)
      end

      # Save and return file
      temp_file = Tempfile.new(['report', '.xlsx'])
      workbook.write(temp_file.path)
      temp_file
    end

    def add_financial_summary_data(worksheet, start_row)
      current_row = start_row

      # Summary section
      if @data[:summary]
        worksheet.add_cell(current_row, 0, 'Resumo Financeiro').change_font_bold(true)
        current_row += 1

        worksheet.add_cell(current_row, 0, 'Receitas')
        worksheet.add_cell(current_row, 1, @data[:summary][:current_period][:total_income])
        current_row += 1

        worksheet.add_cell(current_row, 0, 'Despesas')
        worksheet.add_cell(current_row, 1, @data[:summary][:current_period][:total_expense])
        current_row += 1

        worksheet.add_cell(current_row, 0, 'Saldo')
        worksheet.add_cell(current_row, 1, @data[:summary][:current_period][:net_amount])
        current_row += 2
      end

      # Category breakdown
      if @data[:category_breakdown]&.any?
        worksheet.add_cell(current_row, 0, 'Gastos por Categoria').change_font_bold(true)
        current_row += 1

        # Headers
        worksheet.add_cell(current_row, 0, 'Categoria').change_font_bold(true)
        worksheet.add_cell(current_row, 1, 'Valor').change_font_bold(true)
        worksheet.add_cell(current_row, 2, 'Percentual').change_font_bold(true)
        current_row += 1

        # Data
        @data[:category_breakdown].each do |category|
          worksheet.add_cell(current_row, 0, category[:category_name])
          worksheet.add_cell(current_row, 1, category[:amount])
          worksheet.add_cell(current_row, 2, "#{category[:percentage]}%")
          current_row += 1
        end
      end

      current_row
    end

    def add_budget_performance_data(worksheet, start_row)
      current_row = start_row

      if @data[:budget_details]&.any?
        worksheet.add_cell(current_row, 0, 'Performance dos Orçamentos').change_font_bold(true)
        current_row += 1

        # Headers
        headers = ['Orçamento', 'Categoria', 'Orçado', 'Gasto', 'Restante', 'Utilização', 'Status']
        headers.each_with_index do |header, index|
          worksheet.add_cell(current_row, index, header).change_font_bold(true)
        end
        current_row += 1

        # Data
        @data[:budget_details].each do |budget|
          worksheet.add_cell(current_row, 0, budget[:budget_name])
          worksheet.add_cell(current_row, 1, budget[:category] || 'Geral')
          worksheet.add_cell(current_row, 2, budget[:allocated_amount])
          worksheet.add_cell(current_row, 3, budget[:spent_amount])
          worksheet.add_cell(current_row, 4, budget[:remaining_amount])
          worksheet.add_cell(current_row, 5, "#{budget[:usage_percentage]}%")
          worksheet.add_cell(current_row, 6, budget[:status])
          current_row += 1
        end
      end

      current_row
    end
  end
end
```

### 6. Controller de Analytics
```ruby
# app/controllers/api/v1/analytics_controller.rb
class Api::V1::AnalyticsController < Api::V1::BaseController
  before_action :authenticate_user!

  # GET /api/v1/analytics/financial_summary
  def financial_summary
    generator = Reports::FinancialSummaryGenerator.new(
      user: current_user,
      start_date: parse_date(params[:start_date]) || 1.month.ago,
      end_date: parse_date(params[:end_date]) || Date.current,
      filters: filter_params
    )

    result = generator.call

    render json: {
      success: true,
      data: result
    }
  end

  # GET /api/v1/analytics/budget_performance
  def budget_performance
    generator = Reports::BudgetPerformanceGenerator.new(
      user: current_user,
      start_date: parse_date(params[:start_date]) || Date.current.beginning_of_month,
      end_date: parse_date(params[:end_date]) || Date.current.end_of_month,
      filters: filter_params
    )

    result = generator.call

    render json: {
      success: true,
      data: result
    }
  end

  # GET /api/v1/analytics/trends
  def trends
    service = AnalyticsTrendsService.new(
      user: current_user,
      period: params[:period] || 'monthly',
      months_back: params[:months_back]&.to_i || 12
    )

    result = service.call

    render json: {
      success: true,
      data: result
    }
  end

  # POST /api/v1/analytics/export
  def export
    report = current_user.reports.find_or_initialize_by(
      report_type: params[:report_type],
      name: params[:name] || "#{params[:report_type].humanize} - #{Date.current}"
    )

    data = report.generate_data(
      start_date: parse_date(params[:start_date]),
      end_date: parse_date(params[:end_date]),
      filters: filter_params
    )

    format = params[:format] || 'pdf'
    exported_file = report.export(format)

    send_data(
      File.read(exported_file.path),
      filename: "#{report.name.parameterize}.#{format}",
      type: mime_type_for_format(format),
      disposition: 'attachment'
    )
  end

  private

  def filter_params
    params.permit(:category_id, :transaction_type, :min_amount, :max_amount, category_ids: [])
  end

  def parse_date(date_string)
    return nil if date_string.blank?
    Date.parse(date_string)
  rescue ArgumentError
    nil
  end

  def mime_type_for_format(format)
    case format.downcase
    when 'pdf'
      'application/pdf'
    when 'xlsx', 'excel'
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    when 'csv'
      'text/csv'
    else
      'application/octet-stream'
    end
  end
end
```

### 7. Testes RSpec
```ruby
# spec/services/reports/financial_summary_generator_spec.rb
require 'rails_helper'

RSpec.describe Reports::FinancialSummaryGenerator do
  let(:user) { create(:user) }
  let(:category1) { create(:category, user: user, name: 'Alimentação') }
  let(:category2) { create(:category, user: user, name: 'Transporte') }
  let(:start_date) { 1.month.ago.beginning_of_month }
  let(:end_date) { Date.current.end_of_month }

  let!(:income_transaction) { create(:transaction, user: user, transaction_type: 'income', amount: 5000, date: Date.current) }
  let!(:expense_transaction1) { create(:transaction, user: user, category: category1, transaction_type: 'expense', amount: 300, date: Date.current) }
  let!(:expense_transaction2) { create(:transaction, user: user, category: category2, transaction_type: 'expense', amount: 150, date: Date.current) }

  subject { described_class.new(user: user, start_date: start_date, end_date: end_date) }

  describe '#call' do
    let(:result) { subject.call }

    it 'generates financial summary with correct structure' do
      expect(result).to have_key(:summary)
      expect(result).to have_key(:monthly_breakdown)
      expect(result).to have_key(:category_breakdown)
      expect(result).to have_key(:top_transactions)
      expect(result).to have_key(:insights)
    end

    it 'calculates correct totals' do
      summary = result[:summary][:current_period]

      expect(summary[:total_income]).to eq(5000)
      expect(summary[:total_expense]).to eq(450)
      expect(summary[:net_amount]).to eq(4550)
      expect(summary[:transaction_count]).to eq(3)
    end

    it 'generates category breakdown correctly' do
      category_breakdown = result[:category_breakdown]

      expect(category_breakdown).to be_an(Array)
      expect(category_breakdown.size).to eq(2)

      alimentacao = category_breakdown.find { |c| c[:category_name] == 'Alimentação' }
      expect(alimentacao[:amount]).to eq(300)
      expect(alimentacao[:percentage]).to eq(66.67)
    end

    it 'includes growth rate calculations' do
      growth_rates = result[:summary][:growth_rates]

      expect(growth_rates).to have_key(:income_growth)
      expect(growth_rates).to have_key(:expense_growth)
      expect(growth_rates).to have_key(:net_growth)
    end

    it 'generates insights based on data' do
      insights = result[:insights]

      expect(insights).to be_an(Array)
      expect(insights.first).to have_key(:type)
      expect(insights.first).to have_key(:title)
      expect(insights.first).to have_key(:message)
    end
  end

  describe 'with filters' do
    subject {
      described_class.new(
        user: user,
        start_date: start_date,
        end_date: end_date,
        filters: { category_ids: [category1.id] }
      )
    }

    it 'applies filters correctly' do
      result = subject.call
      summary = result[:summary][:current_period]

      # Should only include category1 transactions
      expect(summary[:total_expense]).to eq(300)
      expect(summary[:transaction_count]).to eq(2) # 1 income + 1 expense from category1
    end
  end
end
```

## Critérios de Sucesso
- [ ] Modelos de relatórios implementados
- [ ] Services para diferentes tipos de relatórios
- [ ] Sistema de analytics robusto
- [ ] Comparações temporais funcionando
- [ ] Exportação em múltiplos formatos
- [ ] Cache inteligente implementado
- [ ] API completa de analytics
- [ ] Performance otimizada
- [ ] Testes unitários com cobertura 90%+
- [ ] Documentação completa

## Performance e Cache
- Cache de relatórios por 1 hora
- Jobs assíncronos para relatórios pesados
- Índices otimizados para queries analíticas
- Paginação para grandes datasets

## Recursos Necessários
- Desenvolvedor backend Rails sênior
- Analista de dados para validação de métricas
- DBA para otimização de queries

## Tempo Estimado
- Modelos e estrutura base: 6-8 horas
- Services de relatórios: 12-15 horas
- Sistema de exportação: 8-10 horas
- API e controllers: 6-8 horas
- Cache e performance: 6-8 horas
- Testes e documentação: 10-12 horas
- **Total**: 7-9 dias de trabalho