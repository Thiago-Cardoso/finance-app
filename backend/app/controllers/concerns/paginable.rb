# backend/app/controllers/concerns/paginable.rb
module Paginable
  extend ActiveSupport::Concern

  def paginate(collection)
    paginated = collection.page(params[:page]).per(params[:per_page] || 10)

    render json: {
      success: true,
      data: paginated,
      meta: {
        current_page: paginated.current_page,
        next_page: paginated.next_page,
        prev_page: paginated.prev_page,
        total_pages: paginated.total_pages,
        total_count: paginated.total_count
      }
    }
  end
end
