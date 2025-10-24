# frozen_string_literal: true

module Api
  module V1
    class CategoriesController < BaseController
      before_action :authenticate_user!
      before_action :set_category, only: %i[show update destroy transactions]
      before_action :authorize_category, only: %i[update destroy]

      def index
        @categories = Category.available_for_user(current_user)
                              .order(:category_type, :name)

        # Filter by type if provided
        @categories = @categories.for_type(params[:category_type]) if params[:category_type].present?

        paginate @categories
      end

      def show
        render json: {
          success: true,
          data: CategorySerializer.new(@category).as_json
        }
      end

      def create
        @category = current_user.categories.build(category_params)

        if @category.save
          render json: {
            success: true,
            data: CategorySerializer.new(@category).as_json,
            message: 'Category created successfully'
          }, status: :created
        else
          render_error('Failed to create category', format_errors(@category.errors))
        end
      end

      def update
        if @category.update(category_params)
          render json: {
            success: true,
            data: CategorySerializer.new(@category).as_json,
            message: 'Category updated successfully'
          }
        else
          render_error('Failed to update category', format_errors(@category.errors))
        end
      end

      def destroy
        if @category.destroy
          render json: {
            success: true,
            message: 'Category deleted successfully'
          }, status: :no_content
        else
          render_error('Failed to delete category', format_errors(@category.errors), :unprocessable_entity)
        end
      rescue ActiveRecord::DeleteRestrictionError => e
        render_error('Cannot delete category with associated records',
                     [{ field: 'base', message: 'Category has transactions or budgets and cannot be deleted' }],
                     :unprocessable_entity)
      end

      def transactions
        @transactions = @category.transactions
                                 .where(user: current_user)
                                 .includes(:account, :transfer_account)
                                 .order(date: :desc, created_at: :desc)
                                 .page(params[:page])
                                 .per(per_page)

        render json: {
          success: true,
          data: TransactionSerializer.new(@transactions).as_json,
          meta: pagination_meta(@transactions)
        }
      end

      def statistics
        service = CategoryStatisticsService.new(current_user, params)
        stats = service.call

        render json: {
          success: true,
          message: 'Estatísticas de categorias calculadas',
          data: stats
        }
      end

      private

      def set_category
        @category = Category.available_for_user(current_user).find(params[:id])
      end

      def authorize_category
        # Prevent modification of default categories
        if @category.is_default?
          render_error('Cannot modify default categories', [], :forbidden)
          return
        end

        return if @category.user_id == current_user.id

        render_error('You can only modify your own categories', [], :forbidden)
      end

      def category_params
        params.require(:category).permit(
          :name, :icon, :color, :category_type, :is_active
        )
      end

      def per_page
        [params[:per_page]&.to_i || 20, 100].min
      end

      def pagination_meta(collection)
        {
          pagination: {
            current_page: collection.current_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count,
            per_page: collection.limit_value
          }
        }
      end

      def format_errors(errors)
        errors.map { |error| { field: error.attribute, message: error.message } }
      end
    end
  end
end
