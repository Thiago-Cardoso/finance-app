Rails.application.routes.draw do
  # Mount Rswag only in development and test environments
  if defined?(Rswag)
    mount Rswag::Ui::Engine => '/api-docs' if defined?(Rswag::Ui::Engine)
    mount Rswag::Api::Engine => '/api-docs' if defined?(Rswag::Api::Engine)
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Devise routes - skip controllers but keep routes for URL helpers in mailers
  devise_for :users, skip: %i[sessions registrations]

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Simple health check for Render and other monitoring services
  get 'health' => 'rails/health#show'

  # API v1 routes
  namespace :api do
    namespace :v1 do
      # Health check endpoint
      get '/health', to: 'health#show'

      # Locales (i18n) endpoints
      resources :locales, only: [:index, :show]

      # Authentication routes
      post 'auth/sign_up', to: 'auth#sign_up'
      post 'auth/sign_in', to: 'auth#sign_in'
      delete 'auth/sign_out', to: 'auth#sign_out'
      post 'auth/refresh_token', to: 'auth#refresh_token'
      post 'auth/reset_password', to: 'auth#reset_password'
      put 'auth/update_password', to: 'auth#update_password'
      post 'auth/confirm_email', to: 'auth#confirm_email'

      # Dashboard endpoint
      get '/dashboard', to: 'dashboard#show'

      # Main application resources (will be implemented in upcoming tasks)
      resources :transactions do
        collection do
          get :summary
          get :search
          get :filter_options
          get :search_suggestions
          get :export
        end
      end

      resources :categories do
        collection do
          get :statistics
        end
        member do
          get :transactions
        end
      end

      resources :accounts do
        member do
          get :balance
          get :transactions
        end
        collection do
          post :transfer
        end
      end

      resources :budgets do
        collection do
          get :current
          get :alerts
        end
      end

      resources :goals do
        member do
          patch :update_progress
          post :contributions, to: 'goals#add_contribution'
        end
      end

      # Reports endpoints
      namespace :reports do
        get :monthly, to: 'monthly#index'
        get :category, to: 'category#index'
        get :cash_flow, to: 'cash_flow#index'
        get :export, to: 'export#create'
      end

      # Analytics endpoints
      get 'analytics/financial_summary', to: 'analytics#financial_summary'
      get 'analytics/budget_performance', to: 'analytics#budget_performance'
      get 'analytics/export', to: 'analytics#export'
      get 'analytics/reports', to: 'analytics#reports'
      get 'analytics/reports/:id', to: 'analytics#show_report'
      delete 'analytics/reports/:id', to: 'analytics#destroy_report'
    end
  end

  # Catch all route for API versioning
  match '*path', to: 'api/v1/application#not_found', via: :all, constraints: lambda { |req|
    req.path.starts_with?('/api/')
  }
end
