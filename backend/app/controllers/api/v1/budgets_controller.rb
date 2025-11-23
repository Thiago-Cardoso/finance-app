# frozen_string_literal: true

module Api
  module V1
    # Budgets Controller for managing budget limits per category
    class BudgetsController < BaseController
      before_action :authenticate_user!
      before_action :set_budget, only: %i[show update destroy]

      # GET /api/v1/budgets
      def index
        @budgets = Budget.for_user(current_user)
                         .includes(:category)
                         .order(created_at: :desc)

        # Filter by period
        @budgets = @budgets.by_period(params[:period_type]) if params[:period_type].present?

        # Filter by category
        @budgets = @budgets.by_category(params[:category_id]) if params[:category_id].present?

        # Filter by status
        @budgets = @budgets.over_budget if params[:status] == 'over_budget'

        # Include expired or only active
        @budgets = @budgets.current unless params[:include_expired] == 'true'

        render json: {
          success: true,
          data: @budgets.map { |budget| budget_json(budget) }
        }
      end

      # GET /api/v1/budgets/current
      def current
        @budgets = Budget.for_user(current_user)
                         .includes(:category)
                         .current
                         .active
                         .order(:name)

        render json: {
          success: true,
          data: @budgets.map { |budget| budget_json(budget) }
        }
      end

      # GET /api/v1/budgets/alerts
      def alerts
        @budgets = Budget.for_user(current_user)
                         .includes(:category)
                         .current
                         .active

        alerts_data = @budgets.select { |b| b.is_near_limit?(0.7) }.map do |budget|
          {
            id: budget.id,
            budget_id: budget.id,
            budget_name: budget.name,
            category_name: budget.category.name,
            category_color: budget.category.color,
            usage_percentage: budget.percentage_used,
            threshold: 70,
            type: budget.is_over_budget? ? 'exceeded' : 'warning',
            message: alert_message(budget),
            created_at: Time.current.iso8601,
            is_read: false
          }
        end

        render json: {
          success: true,
          data: alerts_data
        }
      end

      # GET /api/v1/budgets/:id
      def show
        render json: {
          success: true,
          data: budget_json(@budget)
        }
      end

      # POST /api/v1/budgets
      def create
        @budget = current_user.budgets.build(budget_params)

        # Set default name if not provided
        @budget.name ||= @budget.category&.name

        # Set default period dates if not provided
        if @budget.start_date.blank? && @budget.period == 'monthly'
          @budget.start_date = Date.current.beginning_of_month
          @budget.end_date = Date.current.end_of_month
        end

        if @budget.save
          render json: {
            success: true,
            data: budget_json(@budget),
            message: 'Orçamento criado com sucesso'
          }, status: :created
        else
          render json: {
            success: false,
            error: @budget.errors.full_messages.join(', ')
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/budgets/:id
      def update
        if @budget.update(budget_params)
          render json: {
            success: true,
            data: budget_json(@budget),
            message: 'Orçamento atualizado com sucesso'
          }
        else
          render json: {
            success: false,
            error: @budget.errors.full_messages.join(', ')
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/budgets/:id
      def destroy
        if @budget.update(is_active: false)
          head :no_content
        else
          render json: {
            success: false,
            error: @budget.errors.full_messages.join(', ')
          }, status: :unprocessable_entity
        end
      end

      private

      def set_budget
        @budget = Budget.for_user(current_user).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { success: false, error: 'Orçamento não encontrado' }, status: :not_found
      end

      def budget_params
        params.require(:budget).permit(
          :category_id,
          :name,
          :amount,
          :period,
          :start_date,
          :end_date,
          :is_active
        ).tap do |whitelisted|
          # Map mobile field names to backend field names
          whitelisted[:amount] = params[:budget][:limit_amount] if params[:budget][:limit_amount].present?
          whitelisted[:period] = params[:budget][:period_type] if params[:budget][:period_type].present?
        end
      end

      def budget_json(budget)
        status = calculate_status(budget)
        {
          id: budget.id,
          user_id: budget.user_id,
          category_id: budget.category_id,
          category_name: budget.category.name,
          category_color: budget.category.color,
          category_icon: budget.category.icon,
          limit_amount: budget.amount.to_f,
          spent_amount: budget.spent.to_f,
          remaining_amount: budget.remaining_amount.to_f,
          period_start: budget.start_date.iso8601,
          period_end: budget.end_date.iso8601,
          period_type: budget.period,
          usage_percentage: budget.percentage_used,
          status: status,
          alert_threshold: 80,
          is_alert_enabled: true,
          created_at: budget.created_at.iso8601,
          updated_at: budget.updated_at.iso8601
        }
      end

      def calculate_status(budget)
        percentage = budget.percentage_used
        return 'over_budget' if percentage >= 100
        return 'critical' if percentage >= 90
        return 'warning' if percentage >= 70

        'on_track'
      end

      def alert_message(budget)
        if budget.is_over_budget?
          "Orçamento excedido em #{ActionController::Base.helpers.number_to_currency(budget.spent - budget.amount, unit: 'R$ ')}"
        else
          "#{budget.percentage_used.round(0)}% do orçamento utilizado"
        end
      end
    end
  end
end
