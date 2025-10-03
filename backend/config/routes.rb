Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Devise routes - skip controllers but keep routes for URL helpers in mailers
  devise_for :users, skip: %i[sessions registrations]

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # API v1 routes
  namespace :api do
    namespace :v1 do
      # Health check endpoint
      get '/health', to: 'health#show'

      # Authentication routes
      namespace :auth do
        post :sign_up
        post :sign_in
        delete :sign_out
        post :refresh_token
        post :reset_password
        put :update_password
        post :confirm_email
      end

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
        end
      end

      # Reports endpoints
      namespace :reports do
        get :monthly, to: 'monthly#index'
        get :category, to: 'category#index'
        get :cash_flow, to: 'cash_flow#index'
        get :export, to: 'export#create'
      end
    end
  end

  # Catch all route for API versioning
  match '*path', to: 'api/v1/application#not_found', via: :all, constraints: lambda { |req|
    req.path.starts_with?('/api/')
  }
end
