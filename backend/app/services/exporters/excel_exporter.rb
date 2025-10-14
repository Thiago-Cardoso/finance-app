require 'caxlsx'

module Exporters
  class ExcelExporter
    def initialize(report_data, report_type)
      @report_data = report_data
      @report_type = report_type
      @package = Axlsx::Package.new
      @workbook = @package.workbook
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

      @package.to_stream.read
    end

    private

    def export_financial_summary
      # Summary Sheet
      @workbook.add_worksheet(name: "Resumo") do |sheet|
        # Title
        sheet.add_row ["Resumo Financeiro"], style: title_style
        add_period_info(sheet)
        sheet.add_row []

        # Summary
        sheet.add_row ["Resumo Geral"], style: header_style
        sheet.add_row ["Total de Receitas", @report_data[:summary][:total_income_formatted]]
        sheet.add_row ["Total de Despesas", @report_data[:summary][:total_expenses_formatted]]
        sheet.add_row ["Saldo Líquido", @report_data[:summary][:net_balance_formatted]]
        sheet.add_row ["Total de Transações", @report_data[:summary][:transaction_count]]
        sheet.add_row []

        # Column widths
        sheet.column_widths 30, 20
      end

      # Income Sheet
      if @report_data[:income][:breakdown].any?
        @workbook.add_worksheet(name: "Receitas") do |sheet|
          sheet.add_row ["Categoria", "Total", "Porcentagem", "Quantidade"], style: header_style

          @report_data[:income][:breakdown].each do |item|
            sheet.add_row [
              item[:category_name],
              item[:total_formatted],
              "#{item[:percentage]}%",
              item[:count]
            ]
          end

          sheet.add_row []
          sheet.add_row ["TOTAL", @report_data[:income][:total_formatted], "100%"], style: total_style

          sheet.column_widths 30, 20, 15, 15
        end
      end

      # Expense Sheet
      if @report_data[:expenses][:breakdown].any?
        @workbook.add_worksheet(name: "Despesas") do |sheet|
          sheet.add_row ["Categoria", "Total", "Porcentagem", "Quantidade"], style: header_style

          @report_data[:expenses][:breakdown].each do |item|
            sheet.add_row [
              item[:category_name],
              item[:total_formatted],
              "#{item[:percentage]}%",
              item[:count]
            ]
          end

          sheet.add_row []
          sheet.add_row ["TOTAL", @report_data[:expenses][:total_formatted], "100%"], style: total_style

          sheet.column_widths 30, 20, 15, 15
        end
      end

      # Accounts Sheet
      if @report_data[:accounts]&.any?
        @workbook.add_worksheet(name: "Contas") do |sheet|
          sheet.add_row ["Conta", "Tipo", "Saldo Atual", "Saldo Inicial"], style: header_style

          @report_data[:accounts].each do |account|
            sheet.add_row [
              account[:account_name],
              account[:account_type].titleize,
              account[:current_balance_formatted],
              account[:initial_balance_formatted]
            ]
          end

          sheet.column_widths 30, 20, 20, 20
        end
      end
    end

    def export_budget_performance
      # Overall Performance Sheet
      @workbook.add_worksheet(name: "Resumo") do |sheet|
        sheet.add_row ["Performance de Orçamento"], style: title_style
        add_period_info(sheet)
        sheet.add_row []

        overall = @report_data[:overall]
        sheet.add_row ["Resumo Geral"], style: header_style
        sheet.add_row ["Orçamento Total", overall[:total_budget_formatted]]
        sheet.add_row ["Total Gasto", overall[:total_spent_formatted]]
        sheet.add_row ["Restante", overall[:remaining_formatted]]
        sheet.add_row ["Percentual Usado", "#{overall[:usage_percentage]}%"]
        sheet.add_row ["Status", overall[:status].titleize]
        sheet.add_row []

        sheet.column_widths 30, 20
      end

      # Budget Details Sheet
      if @report_data[:budgets].any?
        @workbook.add_worksheet(name: "Orçamentos") do |sheet|
          sheet.add_row [
            "Orçamento",
            "Categoria",
            "Valor",
            "Gasto",
            "Restante",
            "Uso %",
            "Status"
          ], style: header_style

          @report_data[:budgets].each do |budget|
            sheet.add_row [
              budget[:budget_name],
              budget[:category_name] || "Geral",
              budget[:amount_formatted],
              budget[:spent_formatted],
              budget[:remaining_formatted],
              "#{budget[:usage_percentage]}%",
              budget[:status].titleize
            ]
          end

          sheet.column_widths 25, 20, 15, 15, 15, 10, 15
        end
      end

      # Category Performance Sheet
      if @report_data[:categories]&.any?
        @workbook.add_worksheet(name: "Categorias") do |sheet|
          sheet.add_row [
            "Categoria",
            "Orçamento",
            "Gasto",
            "Restante",
            "Uso %",
            "Status"
          ], style: header_style

          @report_data[:categories].each do |category|
            sheet.add_row [
              category[:category_name],
              category[:total_budget_formatted],
              category[:spent_formatted],
              category[:remaining_formatted],
              "#{category[:usage_percentage]}%",
              category[:status].titleize
            ]
          end

          sheet.column_widths 30, 20, 20, 20, 10, 15
        end
      end

      # Alerts Sheet
      if @report_data[:alerts]&.any?
        @workbook.add_worksheet(name: "Alertas") do |sheet|
          sheet.add_row ["Nível", "Orçamento", "Mensagem", "Uso %"], style: header_style

          @report_data[:alerts].each do |alert|
            sheet.add_row [
              alert[:level].titleize,
              alert[:budget_name],
              alert[:message],
              "#{alert[:usage_percentage]}%"
            ]
          end

          sheet.column_widths 15, 25, 50, 10
        end
      end
    end

    def export_generic
      @workbook.add_worksheet(name: "Relatório") do |sheet|
        sheet.add_row ["Relatório"], style: title_style
        sheet.add_row ["Dados do relatório não disponíveis no formato Excel"]
      end
    end

    def add_period_info(sheet)
      return unless @report_data[:period]

      period = @report_data[:period]
      sheet.add_row [
        "Período: #{period[:start_date].strftime('%d/%m/%Y')} a #{period[:end_date].strftime('%d/%m/%Y')}"
      ]
      sheet.add_row ["Gerado em: #{@report_data[:generated_at]&.strftime('%d/%m/%Y %H:%M:%S')}"]
    end

    # Styles
    def title_style
      @title_style ||= @workbook.styles.add_style(
        sz: 16,
        b: true,
        alignment: { horizontal: :center }
      )
    end

    def header_style
      @header_style ||= @workbook.styles.add_style(
        bg_color: "3C8DBC",
        fg_color: "FFFFFF",
        b: true,
        alignment: { horizontal: :center }
      )
    end

    def total_style
      @total_style ||= @workbook.styles.add_style(
        b: true,
        bg_color: "F0F0F0"
      )
    end
  end
end
