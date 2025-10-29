# frozen_string_literal: true

module Api
  module V1
    # Goals API controller
    class GoalsController < BaseController
      before_action :authenticate_user!
      before_action :set_goal, only: %i[show update destroy add_contribution]

      # GET /api/v1/goals
      def index
        goals = current_user.goals
                            .includes(:category, :goal_milestones, :goal_contributions)
                            .order(created_at: :desc)

        goals = filter_goals(goals) if has_filters?

        render json: {
          success: true,
          data: goals.as_json(
            include: {
              goal_milestones: { only: %i[id name target_percentage status completed_at] },
              category: { only: %i[id name color icon] }
            },
            methods: %i[progress_percentage remaining_amount days_remaining is_overdue? is_on_track?]
          ),
          meta: build_index_meta(goals)
        }
      end

      # GET /api/v1/goals/:id
      def show
        render json: {
          success: true,
          data: @goal.as_json(
            include: {
              goal_milestones: { only: %i[id name target_percentage reward_points status completed_at description] },
              goal_contributions: { only: %i[id amount description contributed_at], methods: [:contributor_name] },
              goal_activities: { only: %i[id activity_type description metadata created_at], limit: 10 },
              category: { only: %i[id name color icon] }
            },
            methods: %i[progress_percentage remaining_amount days_remaining is_overdue? is_on_track? monthly_target]
          )
        }
      end

      # POST /api/v1/goals
      def create
        goal = current_user.goals.build(goal_params)

        if goal.save
          render json: {
            success: true,
            data: goal.as_json(methods: %i[progress_percentage remaining_amount]),
            message: 'Meta criada com sucesso'
          }, status: :created
        else
          render json: {
            success: false,
            message: 'Erro ao criar meta',
            errors: goal.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/goals/:id
      def update
        if @goal.update(goal_params)
          render json: {
            success: true,
            data: @goal.as_json(methods: %i[progress_percentage remaining_amount]),
            message: 'Meta atualizada com sucesso'
          }
        else
          render json: {
            success: false,
            message: 'Erro ao atualizar meta',
            errors: @goal.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/goals/:id
      def destroy
        @goal.destroy
        render json: {
          success: true,
          message: 'Meta excluída com sucesso'
        }
      end

      # POST /api/v1/goals/:id/contributions
      def add_contribution
        contribution = @goal.add_contribution(
          contribution_params[:amount],
          contribution_params[:description]
        )

        if contribution&.persisted?
          @goal.reload
          render json: {
            success: true,
            data: {
              contribution: contribution.as_json(methods: [:contributor_name]),
              goal: @goal.as_json(methods: %i[progress_percentage remaining_amount])
            },
            message: 'Contribuição adicionada com sucesso'
          }
        else
          render json: {
            success: false,
            message: 'Erro ao adicionar contribuição',
            errors: contribution&.errors&.full_messages || ['Valor inválido']
          }, status: :unprocessable_entity
        end
      end

      private

      def set_goal
        @goal = current_user.goals.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: {
          success: false,
          message: 'Meta não encontrada'
        }, status: :not_found
      end

      def goal_params
        params.require(:goal).permit(
          :name, :description, :target_amount, :target_date, :goal_type,
          :priority, :category_id, :baseline_amount, :auto_track_progress
        )
      end

      def contribution_params
        params.require(:contribution).permit(:amount, :description)
      end

      def filter_params
        params.permit(:status, :goal_type, :priority, :category_id)
      end

      def filter_goals(goals)
        goals = goals.where(status: filter_params[:status]) if filter_params[:status].present?
        goals = goals.where(goal_type: filter_params[:goal_type]) if filter_params[:goal_type].present?
        goals = goals.where(priority: filter_params[:priority]) if filter_params[:priority].present?
        goals = goals.where(category_id: filter_params[:category_id]) if filter_params[:category_id].present?
        goals
      end

      def build_index_meta(goals)
        {
          total_count: goals.count,
          active_count: goals.active.count,
          completed_count: goals.completed.count,
          total_target_amount: goals.active.sum(:target_amount),
          total_current_amount: goals.active.sum(:current_amount)
        }
      end

      def has_filters?
        params[:status].present? || params[:goal_type].present? ||
        params[:priority].present? || params[:category_id].present?
      end
    end
  end
end
