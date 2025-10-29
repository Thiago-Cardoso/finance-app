require 'csv'

module Exporters
  class CsvExporter
    def initialize(report_data, report_type)
      @report_data = report_data
      @report_type = report_type
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
    end

    private

    def export_financial_summary
      CSV.generate do |csv|
        # Title and period
        csv << ["Resumo Financeiro"]
        add_period_info(csv)
        csv << []

        # Summary
        csv << ["Resumo Geral"]
        csv << ["Total de Receitas", @report_data[:summary][:total_income_formatted]]
        csv << ["Total de Despesas", @report_data[:summary][:total_expenses_formatted]]
        csv << ["Saldo Líquido", @report_data[:summary][:net_balance_formatted]]
        csv << ["Total de Transações", @report_data[:summary][:transaction_count]]
        csv << []

        # Income breakdown
        if @report_data[:income][:breakdown].any?
          csv << []
          csv << ["RECEITAS"]
          csv << ["Categoria", "Total", "Porcentagem", "Quantidade"]
          @report_data[:income][:breakdown].each do |item|
            csv << [
              item[:category_name],
              item[:total_formatted],
              "#{item[:percentage]}%",
              item[:count]
            ]
          end
          csv << ["TOTAL", @report_data[:income][:total_formatted], "100%", ""]
        end

        # Expense breakdown
        if @report_data[:expenses][:breakdown].any?
          csv << []
          csv << ["DESPESAS"]
          csv << ["Categoria", "Total", "Porcentagem", "Quantidade"]
          @report_data[:expenses][:breakdown].each do |item|
            csv << [
              item[:category_name],
              item[:total_formatted],
              "#{item[:percentage]}%",
              item[:count]
            ]
          end
          csv << ["TOTAL", @report_data[:expenses][:total_formatted], "100%", ""]
        end

        # Accounts
        if @report_data[:accounts]&.any?
          csv << []
          csv << ["CONTAS"]
          csv << ["Conta", "Tipo", "Saldo Atual", "Saldo Inicial"]
          @report_data[:accounts].each do |account|
            csv << [
              account[:account_name],
              account[:account_type].titleize,
              account[:current_balance_formatted],
              account[:initial_balance_formatted]
            ]
          end
        end
      end
    end

    def export_budget_performance
      CSV.generate do |csv|
        # Title and period
        csv << ["Performance de Orçamento"]
        add_period_info(csv)
        csv << []

        # Overall performance
        overall = @report_data[:overall]
        csv << ["Resumo Geral"]
        csv << ["Orçamento Total", overall[:total_budget_formatted]]
        csv << ["Total Gasto", overall[:total_spent_formatted]]
        csv << ["Restante", overall[:remaining_formatted]]
        csv << ["Percentual Usado", "#{overall[:usage_percentage]}%"]
        csv << ["Status", overall[:status].titleize]
        csv << []

        # Budget details
        if @report_data[:budgets].any?
          csv << []
          csv << ["ORÇAMENTOS"]
          csv << ["Orçamento", "Categoria", "Valor", "Gasto", "Restante", "Uso %", "Status"]
          @report_data[:budgets].each do |budget|
            csv << [
              budget[:budget_name],
              budget[:category_name] || "Geral",
              budget[:amount_formatted],
              budget[:spent_formatted],
              budget[:remaining_formatted],
              "#{budget[:usage_percentage]}%",
              budget[:status].titleize
            ]
          end
        end

        # Category performance
        if @report_data[:categories]&.any?
          csv << []
          csv << ["CATEGORIAS"]
          csv << ["Categoria", "Orçamento", "Gasto", "Restante", "Uso %", "Status"]
          @report_data[:categories].each do |category|
            csv << [
              category[:category_name],
              category[:total_budget_formatted],
              category[:spent_formatted],
              category[:remaining_formatted],
              "#{category[:usage_percentage]}%",
              category[:status].titleize
            ]
          end
        end

        # Alerts
        if @report_data[:alerts]&.any?
          csv << []
          csv << ["ALERTAS"]
          csv << ["Nível", "Orçamento", "Mensagem", "Uso %"]
          @report_data[:alerts].each do |alert|
            csv << [
              alert[:level].titleize,
              alert[:budget_name],
              alert[:message],
              "#{alert[:usage_percentage]}%"
            ]
          end
        end
      end
    end

    def export_generic
      CSV.generate do |csv|
        csv << ["Relatório"]
        csv << ["Dados do relatório não disponíveis no formato CSV"]
      end
    end

    def add_period_info(csv)
      return unless @report_data[:period]

      period = @report_data[:period]
      csv << [
        "Período: #{period[:start_date].strftime('%d/%m/%Y')} a #{period[:end_date].strftime('%d/%m/%Y')}"
      ]
      csv << ["Gerado em: #{@report_data[:generated_at]&.strftime('%d/%m/%Y %H:%M:%S')}"]
    end
  end
end
