require 'prawn'
require 'prawn/table'

module Exporters
  class PdfExporter
    def initialize(report_data, report_type)
      @report_data = report_data
      @report_type = report_type
      @pdf = Prawn::Document.new
    end

    def export
      case @report_type.to_sym
      when :financial_summary
        export_financial_summary
      when :budget_performance
        export_budget_performance
      else
        export_generic
      end

      @pdf.render
    end

    private

    def export_financial_summary
      # Header
      add_header("Resumo Financeiro")
      add_period_info

      # Summary
      @pdf.move_down 20
      @pdf.text "Resumo Geral", size: 16, style: :bold
      @pdf.move_down 10

      summary_data = [
        ["Total de Receitas", @report_data[:summary][:total_income_formatted]],
        ["Total de Despesas", @report_data[:summary][:total_expenses_formatted]],
        ["Saldo Líquido", @report_data[:summary][:net_balance_formatted]],
        ["Total de Transações", @report_data[:summary][:transaction_count].to_s]
      ]

      @pdf.table(summary_data, width: 540) do
        style(row(0..-1), padding: 10)
        style(row(0..-1).column(0), font_style: :bold)
      end

      # Income Breakdown
      if @report_data[:income][:breakdown].any?
        @pdf.move_down 20
        @pdf.text "Receitas por Categoria", size: 14, style: :bold
        @pdf.move_down 10

        income_data = [["Categoria", "Total", "Porcentagem"]]
        @report_data[:income][:breakdown].each do |item|
          income_data << [
            item[:category_name],
            item[:total_formatted],
            "#{item[:percentage]}%"
          ]
        end

        @pdf.table(income_data, width: 540, header: true) do
          style(row(0), background_color: '00A65A', text_color: 'FFFFFF', font_style: :bold)
          style(row(1..-1), padding: 8)
        end
      end

      # Expense Breakdown
      if @report_data[:expenses][:breakdown].any?
        @pdf.move_down 20
        @pdf.text "Despesas por Categoria", size: 14, style: :bold
        @pdf.move_down 10

        expense_data = [["Categoria", "Total", "Porcentagem"]]
        @report_data[:expenses][:breakdown].each do |item|
          expense_data << [
            item[:category_name],
            item[:total_formatted],
            "#{item[:percentage]}%"
          ]
        end

        @pdf.table(expense_data, width: 540, header: true) do
          style(row(0), background_color: 'DD4B39', text_color: 'FFFFFF', font_style: :bold)
          style(row(1..-1), padding: 8)
        end
      end

      add_footer
    end

    def export_budget_performance
      # Header
      add_header("Performance de Orçamento")
      add_period_info

      # Overall Performance
      @pdf.move_down 20
      @pdf.text "Resumo Geral", size: 16, style: :bold
      @pdf.move_down 10

      overall = @report_data[:overall]
      overall_data = [
        ["Orçamento Total", overall[:total_budget_formatted]],
        ["Total Gasto", overall[:total_spent_formatted]],
        ["Restante", overall[:remaining_formatted]],
        ["Percentual Usado", "#{overall[:usage_percentage]}%"],
        ["Status", overall[:status].titleize]
      ]

      @pdf.table(overall_data, width: 540) do
        style(row(0..-1), padding: 10)
        style(row(0..-1).column(0), font_style: :bold)
      end

      # Budget Details
      if @report_data[:budgets].any?
        @pdf.move_down 20
        @pdf.text "Detalhes dos Orçamentos", size: 14, style: :bold
        @pdf.move_down 10

        budget_data = [["Orçamento", "Valor", "Gasto", "Restante", "Uso %", "Status"]]
        @report_data[:budgets].each do |budget|
          budget_data << [
            budget[:budget_name],
            budget[:amount_formatted],
            budget[:spent_formatted],
            budget[:remaining_formatted],
            "#{budget[:usage_percentage]}%",
            budget[:status].titleize
          ]
        end

        @pdf.table(budget_data, width: 540, header: true) do
          style(row(0), background_color: '3C8DBC', text_color: 'FFFFFF', font_style: :bold)
          style(row(1..-1), padding: 6)
        end
      end

      # Alerts
      if @report_data[:alerts].any?
        @pdf.move_down 20
        @pdf.text "Alertas", size: 14, style: :bold, color: 'DD4B39'
        @pdf.move_down 10

        @report_data[:alerts].each do |alert|
          color = case alert[:type]
                  when 'danger' then 'DD4B39'
                  when 'warning' then 'F39C12'
                  else '3C8DBC'
                  end

          @pdf.fill_color color
          @pdf.text "• #{alert[:budget_name]}: #{alert[:message]}", size: 10
          @pdf.fill_color '000000'
        end
      end

      add_footer
    end

    def export_generic
      add_header("Relatório")
      @pdf.text "Dados do relatório não disponíveis no formato PDF"
      add_footer
    end

    def add_header(title)
      @pdf.text title, size: 24, style: :bold, align: :center
      @pdf.move_down 5
      @pdf.stroke_horizontal_rule
      @pdf.move_down 10
    end

    def add_period_info
      return unless @report_data[:period]

      period = @report_data[:period]
      @pdf.text "Período: #{period[:start_date].strftime('%d/%m/%Y')} a #{period[:end_date].strftime('%d/%m/%Y')}",
                size: 12,
                align: :center
    end

    def add_footer
      @pdf.move_down 30
      @pdf.stroke_horizontal_rule
      @pdf.move_down 10
      @pdf.text "Gerado em: #{@report_data[:generated_at]&.strftime('%d/%m/%Y %H:%M:%S')}",
                size: 8,
                align: :right
    end
  end
end
