# Personal Finance App

A complete personal finance control system with a modern interface and a robust RESTful API developed using AI and the Claude Sonnet 4.5 LLM with the support of Agents.

## Overview

A full-stack web application for personal finance management, allowing control of transactions, categories, budgets, financial goals, and the generation of detailed analytical reports.

## Tech Stack

### Backend

  - **Ruby on Rails 8.0.3** - API Framework
  - **PostgreSQL** - Relational database
  - **RSpec** - Testing framework (478 tests, 100% passing)
  - **Devise + JWT** - Authentication and authorization
  - **Swagger/OpenAPI** - API documentation
  - **Prawn** - PDF generation
  - **Caxlsx** - Excel export

### Frontend

  - **Next.js 15** - React Framework
  - **TypeScript** - Static typing
  - **Tailwind CSS** - Styling framework
  - **React Query** - State management and caching
  - **Recharts** - Charts and visualizations
  - **Axios** - HTTP client

## Features

### Financial Management

  - Transactions (income, expenses, and transfers)
  - Customizable categories
  - Multiple bank accounts
  - Budgets by category and period
  - Financial goals with progress tracking

### Smart Dashboard

  - Monthly financial summary
  - Balance evolution (last 6 months)
  - Top 5 expense categories
  - Budget status
  - Goal progress
  - Recent transactions

### Reports and Analytics

  - Financial summary
  - Budget performance
  - Category analysis
  - Export to PDF, Excel, and CSV
  - Interactive charts and visualizations

### Additional Features

  - Advanced transaction filters
  - Smart search suggestions
  - Caching for better performance
  - Robust data validation
  - Complete error handling

## Prerequisites

  - **Ruby** 3.2.0 or higher
  - **Rails** 8.0.3
  - **PostgreSQL** 14 or higher
  - **Node.js** 18 or higher
  - **npm** or **yarn**
  - **Bundler** 2.x

## Installation

### 1\. Clone the Repository

```bash
git clone <repository-url>
cd finance-app
```

### 2\. Backend Setup

```bash
cd backend

# Install dependencies
bundle install

# Configure database
cp config/database.yml.example config/database.yml
# Edit config/database.yml with your PostgreSQL credentials

# Create and populate the database
rails db:create
rails db:migrate
rails db:seed

# Configure environment variables
cp .env.example .env
# Edit .env with your settings
```

### 3\. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with the backend URL
```

## Configuration

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/finance_app_development
DEVISE_JWT_SECRET_KEY=<your-secret-key>
RAILS_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Personal Finance
```

## Running the Application

### Start Backend (Port 3000)

```bash
cd backend
bundle exec rails server -p 3000
```

The backend will be available at: `http://localhost:3000`

### Start Frontend (Port 3001)

```bash
cd frontend
PORT=3001 npm run dev
```

The frontend will be available at: `http://localhost:3001`

## API Documentation (Swagger)

The interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

### How to Test the API with Swagger

1.  Access `http://localhost:3000/api-docs`
2.  Log in using the `POST /api/v1/auth/sign_in` endpoint
3.  Copy the JWT token from the response
4.  Click the "Authorize" button at the top of the page
5.  Paste the token in the format: `Bearer <your-token>`
6.  You can now test all authenticated endpoints

### Example Login via cURL

```bash
curl -X POST http://localhost:3000/api/v1/auth/sign_in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Example Authenticated Request

```bash
curl -X GET http://localhost:3000/api/v1/categories/1 \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json"
```

## Tests

### Backend (RSpec)

```bash
cd backend

# Run all tests
bundle exec rspec

# Run with details
bundle exec rspec --format documentation

# Run a specific file
bundle exec rspec spec/models/transaction_spec.rb

# Run with coverage
COVERAGE=true bundle exec rspec
```

### Test Results (October 2025)

```
==========================================
   BACKEND TEST RESULTS - ALL PASSING
==========================================

Total Examples: 478
Failures: 0
Success Rate: 100%

Test Execution Time: 5.68 seconds
Coverage: 71.92%

Status: ✓ ALL TESTS PASSING

==========================================
```

All 478 tests are passing, including:

  - Model tests
  - Controller tests
  - Service tests
  - API integration tests
  - Authentication tests
  - Validation tests
  - Callback tests
  - Scope tests
  - Swagger/OpenAPI tests

### Frontend

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Project Structure

```
finance-app/
├── backend/                 # Rails API
│   ├── app/
│   │   ├── controllers/     # API Controllers
│   │   ├── models/          # ActiveRecord Models
│   │   ├── services/        # Business logic
│   │   ├── serializers/     # JSON Serializers
│   │   └── exporters/       # Exporters (PDF, Excel, CSV)
│   ├── config/              # Configurations
│   ├── db/                  # Migrations and seeds
│   ├── spec/                # RSpec tests
│   └── swagger/             # OpenAPI Schemas
│
└── frontend/                # Next.js App
    ├── src/
    │   ├── app/             # Routes and pages
    │   ├── components/      # React components
    │   ├── hooks/           # Custom hooks
    │   ├── services/        # API services
    │   ├── types/           # TypeScript definitions
    │   └── utils/           # Utilities
    └── public/              # Static files
```

## Main API Endpoints

### Authentication

  - `POST /api/v1/auth/sign_up` - User registration
  - `POST /api/v1/auth/sign_in` - Login
  - `DELETE /api/v1/auth/sign_out` - Logout
  - `POST /api/v1/auth/refresh_token` - Renew token
  - `POST /api/v1/auth/reset_password` - Request password reset
  - `PUT /api/v1/auth/update_password` - Update password
  - `POST /api/v1/auth/confirm_email` - Confirm email

### Transactions

  - `GET /api/v1/transactions` - List transactions (with filters and pagination)
  - `POST /api/v1/transactions` - Create transaction
  - `GET /api/v1/transactions/:id` - Transaction details
  - `PUT /api/v1/transactions/:id` - Update transaction
  - `DELETE /api/v1/transactions/:id` - Delete transaction
  - `GET /api/v1/transactions/summary` - Transaction summary
  - `GET /api/v1/transactions/filter_options` - Filter options
  - `GET /api/v1/transactions/search_suggestions` - Search suggestions

### Categories

  - `GET /api/v1/categories` - List categories
  - `POST /api/v1/categories` - Create category
  - `GET /api/v1/categories/:id` - Category details
  - `PUT /api/v1/categories/:id` - Update category
  - `DELETE /api/v1/categories/:id` - Delete category
  - `GET /api/v1/categories/:id/transactions` - Transactions in a category
  - `GET /api/v1/categories/statistics` - Category statistics

### Accounts

  - `GET /api/v1/accounts` - List accounts
  - `POST /api/v1/accounts` - Create account
  - `GET /api/v1/accounts/:id` - Account details
  - `PUT /api/v1/accounts/:id` - Update account
  - `DELETE /api/v1/accounts/:id` - Delete account

### Budgets

  - `GET /api/v1/budgets` - List budgets
  - `POST /api/v1/budgets` - Create budget
  - `GET /api/v1/budgets/:id` - Budget details
  - `PUT /api/v1/budgets/:id` - Update budget
  - `DELETE /api/v1/budgets/:id` - Delete budget

### Goals

  - `GET /api/v1/goals` - List goals
  - `POST /api/v1/goals` - Create goal
  - `GET /api/v1/goals/:id` - Goal details
  - `PUT /api/v1/goals/:id` - Update goal
  - `DELETE /api/v1/goals/:id` - Delete goal
  - `POST /api/v1/goals/:id/contributions` - Add contribution

### Dashboard

  - `GET /api/v1/dashboard` - Dashboard data

### Analytics

  - `GET /api/v1/analytics/financial_summary` - Financial summary
  - `GET /api/v1/analytics/budget_performance` - Budget performance
  - `GET /api/v1/analytics/export` - Export reports (PDF, Excel, CSV)
  - `GET /api/v1/analytics/reports` - List saved reports
  - `GET /api/v1/analytics/reports/:id` - Report details
  - `DELETE /api/v1/analytics/reports/:id` - Delete report

## Application Screenshots

### Dashboard

The dashboard provides a complete view of your finances with:

  - Monthly financial summary (income, expenses, balance)
  - Balance evolution chart for the last 6 months
  - Top 5 expense categories with a pie chart
  - Status of active budgets
  - Progress of financial goals
  - List of recent transactions

### Transactions Page

A complete interface for managing transactions:

  - List of all transactions (income, expenses, transfers)
  - Filters by type and category
  - Advanced filters (date, account, amount)
  - Button to add a new transaction
  - Detailed view with category and amount
  - Edit and delete options for each transaction

### Goals Page

Track the progress of your financial goals:

  - Cards with a summary of goals (total, active, completed)
  - Overall progress percentage
  - Filters by status, type, and priority
  - View of each goal with a progress bar
  - Details of target amount and deadline
  - Visual status (active, completed, etc.)

### Swagger API Documentation

Complete interactive API documentation:

  - All endpoints organized by category
  - Request and response schemas
  - "Authorize" button for authentication
  - Direct testing of endpoints in the interface
  - Request examples
  - Detailed description of each endpoint
  - HTTP status codes
  - Data models

## Troubleshooting

### Backend fails to start

1.  Check if PostgreSQL is running:

    ```bash
    pg_isready
    ```

2.  Verify the database credentials in `config/database.yml`

3.  Recreate the database:

    ```bash
    rails db:drop db:create db:migrate db:seed
    ```

### Authentication error

1.  Check if the `DEVISE_JWT_SECRET_KEY` variable is set

2.  Ensure the token is being sent in the header:

    ```
    Authorization: Bearer <token>
    ```

3.  Verify that the token has not expired (tokens are valid for 24 hours)

### Failing tests

1.  Make sure you are in the test environment:

    ```bash
    RAILS_ENV=test rails db:migrate
    ```

2.  Clean the test database:

    ```bash
    RAILS_ENV=test rails db:reset
    ```

3.  Run tests with a specific seed:

    ```bash
    bundle exec rspec --seed 1234
    ```

### Frontend cannot connect to the backend

1.  Check if the backend is running on port 3000
2.  Verify the `NEXT_PUBLIC_API_URL` variable in `.env.local`
3.  Check the CORS configuration in the backend (`config/initializers/cors.rb`)
4.  Clear the browser cache

### CORS Error

Ensure that CORS is correctly configured in `backend/config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:3001'
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## Technical Features

### Caching

The system uses in-memory caching to optimize performance:

  - Dashboard (5 minutes)
  - Financial summary (1 hour)
  - Budget performance (1 hour)

### Validations

  - All inputs are validated on the backend
  - Data type validation
  - Date range validation
  - Prevention of deletion of related data
  - Monetary value validation

### Security

  - JWT authentication
  - Tokens with expiration (24 hours)
  - Refresh tokens for renewal
  - Resource ownership validation
  - Input sanitization
  - Configured CORS
  - Password encryption with bcrypt
  - SQL injection prevention
  - Parameter validation

### Performance

  - Eager loading to avoid N+1 queries
  - Database indexes
  - Caching of frequent queries
  - Result pagination
  - Response compression

## Future Improvements

  - [ ] Additional analysis charts
  - [ ] Notifications for exceeded budgets
  - [ ] Import of bank statements (OFX, CSV)
  - [ ] Mobile app with React Native
  - [ ] Integration with banks via API (Open Banking)
  - [ ] Forecasts and insights with AI
  - [ ] Offline mode with synchronization
  - [ ] Budget sharing
  - [ ] Automatic categorization with ML
  - [ ] Custom alerts
  - [ ] Customizable dashboard
  - [ ] Custom themes

## Contribution

Contributions are welcome\! Please:

1.  Fork the project
2.  Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, open an issue on GitHub or contact us via email.

## Authors

  - Thiago Cardoso

## Acknowledgments

  - Rails Community
  - React/Next.js Community
  - Open source contributors
  - Claude AI for assistance in development

-----

**Project Status:** In active development

**Last updated:** October 2025

**Version:** 1.0.0