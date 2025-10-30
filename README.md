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

## AI-Powered Development

This project was developed using **Claude Sonnet 4.5** with an advanced AI-driven workflow that leverages specialized agents and Model Context Protocol (MCP) integrations. The development process showcases modern AI-assisted software engineering practices.

### Development Workflow

The project follows a structured AI-assisted development methodology:

1. **Product Requirements Document (PRD)** - Using the `creator-prd` agent
   - Initial feature conceptualization and requirements gathering
   - Stakeholder needs analysis
   - Success criteria definition
   - User stories and acceptance criteria

2. **Technical Specification** - Using the `creator-techspec` agent
   - Architectural design decisions
   - Technology stack selection
   - Database schema design
   - API endpoint specifications
   - Component structure planning

3. **Task Breakdown** - Using the `creator-tasks` agent
   - Comprehensive task list generation
   - Identification of sequential dependencies
   - Maximization of parallel work streams
   - Priority assignment and time estimation

4. **Task Execution** - Using specialized execution agents
   - Automated code generation
   - Test-driven development
   - Real-time debugging and fixes
   - Code quality assurance

### AI Agents Architecture

 `.claude/agents/`, the project utilizes specialized agents:

- **creator-prd**: Generates comprehensive Product Requirement Documents using standardized templates
- **creator-techspec**: Creates detailed Technical Specifications from approved PRDs
- **creator-tasks**: Analyzes PRD and Tech Spec to generate granular, actionable task lists
- **github-commit-pr-agent**: Handles Git operations, commit creation, and pull request management

### MCP Integrations

The development process integrates several Model Context Protocol (MCP) servers for enhanced capabilities:

#### Context7 MCP
- **Purpose**: Real-time access to up-to-date library documentation
- **Usage**: Ensuring code follows current best practices and latest API specifications
- **Benefits**: Reduced documentation lookup time, accurate implementation patterns

#### Playwright MCP
- **Purpose**: Browser automation and end-to-end testing
- **Usage**: Automated UI testing, screenshot capture, and interaction validation
- **Benefits**: Comprehensive test coverage, visual regression testing

#### Supabase MCP
- **Purpose**: Database management and operations
- **Usage**: Schema migrations, query execution, and data validation
- **Benefits**: Streamlined database operations, type-safe queries

#### GitHub MCP with Copilot Integration
- **Purpose**: Code review automation and pull request management
- **Usage**:
  - Automated code review with GitHub Copilot
  - Pull request creation following conventional commits
  - Code quality checks and suggestions
  - Automated changelog generation
- **Benefits**: Consistent code quality, faster review cycles, standardized commit messages

#### IDE MCP
- **Purpose**: Direct integration with development environment
- **Usage**: Real-time diagnostics, code navigation, and error detection
- **Benefits**: Immediate feedback, reduced context switching

### Slash Commands

Custom slash commands (`.claude/commands/`) streamline the development workflow:

- `/creator-prd` - Initialize PRD creation for new features
- `/creator-techspec` - Generate technical specifications from PRDs
- `/creator-tasks` - Break down specifications into actionable tasks
- `/execute-task` - Execute specific tasks from the task list
- `/review-task` - Review and validate completed tasks

### Development Benefits

This AI-powered approach delivered several key advantages:

1. **Consistency**: Standardized documentation and code patterns across the entire codebase
2. **Speed**: Rapid prototyping and implementation with automated code generation
3. **Quality**: Built-in test generation and continuous validation
4. **Documentation**: Comprehensive, always up-to-date technical documentation
5. **Best Practices**: Automatic adherence to framework conventions and design patterns
6. **Testing**: 478 comprehensive tests achieving 100% pass rate
7. **Collaboration**: Clear task breakdown enabling potential team scaling

### Example Workflow

```
User Request → PRD Generation → Tech Spec Creation → Task Breakdown
     ↓              ↓                  ↓                   ↓
  Context7      Database          API Design        Sequential
  Research      Schema          Components         & Parallel
                Design          Structure           Tasks
                   ↓                  ↓                   ↓
            Implementation → Testing → Code Review → PR Creation
                   ↓              ↓          ↓            ↓
               Playwright     RSpec Tests  GitHub    Conventional
               E2E Tests      100% Pass    Copilot    Commits
```

### Learn More

To explore the AI agents and commands used in this project:

- Agent definitions: `.claude/agents/`
- Slash commands: `.claude/commands/`
- MCP configuration: `.mcp.json`

This development methodology demonstrates how AI can augment software engineering workflows while maintaining high code quality, comprehensive testing, and proper documentation standards.

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

### Login Screen

![Login Screen](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/tela-login.png)

Clean and modern authentication interface featuring:
- Email and password fields with validation
- Remember me functionality
- Secure JWT token-based authentication
- Dark mode support
- Responsive design for all devices
- Password recovery option

### Registration Page

![Registration Page](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/pagina-registro.png)

User-friendly registration process with:
- First name, last name, email, and password fields
- Real-time validation feedback
- Password strength indicator
- Terms and conditions acceptance
- Automatic login after successful registration
- Clean error handling and user feedback

### Dashboard - Main View

![Dashboard After Registration](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/dashboard-after-register.png)

Comprehensive financial overview displaying:
- **Quick Actions Panel**: Fast access to create transactions, budgets, and goals
- **Financial Summary Cards**:
  - Total income for the current month
  - Total expenses tracked
  - Current balance with variation indicator
- **Monthly Trend Chart**: Interactive line chart showing balance evolution over the last 6 months
- **Top Expense Categories**: Pie chart visualization of spending distribution
- **Recent Transactions**: Latest financial activities with category tags
- **Goals Progress Widget**: Visual progress bars for active financial goals
- **Budget Status**: Real-time tracking of budget utilization

### Dashboard - Goals Widget

![Dashboard Goals Fixed](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/dashboard-goal-fixed.png)

Enhanced goals section featuring:
- Progress bars with percentage completion
- Target amount and current amount display
- Days remaining until deadline
- Visual status indicators (active, paused, completed)
- Quick contribution button
- Color-coded priority levels
- Smooth animations and transitions

### Dashboard - Chart View

![Dashboard Chart Fixed](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/dashboard-chart-fixed.png)

Interactive analytics visualization:
- Responsive Recharts implementation
- 6-month balance evolution trend line
- Hover tooltips with detailed information
- Smooth animations on data updates
- Color-coded positive/negative changes
- Mobile-responsive chart scaling
- Export capability for reports

### Transactions Page - Filters

![Transactions Page with Filters](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/transactions-selects-after-reload.png)

Advanced transaction management interface:
- **Filter Options**:
  - Transaction type (Income, Expense, Transfer)
  - Category selection with custom categories
  - Date range picker
  - Account filter
  - Amount range filter
- **Transaction List**:
  - Color-coded by type (green for income, red for expense)
  - Category badges with icons
  - Account information display
  - Date and time stamps
  - Quick edit and delete actions
- **Search Functionality**: Smart search with suggestions
- **Pagination**: Efficient handling of large transaction sets

### Reports Page - Combobox Filters

![Reports Page Combobox](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/reports-page-combobox.png)

Sophisticated reporting interface with:
- Custom styled Select components using Tailwind CSS
- Multiple filter dimensions:
  - Report type (Financial Summary, Budget Performance, etc.)
  - Period type (Daily, Weekly, Monthly, Quarterly, Yearly)
  - Date range selection
  - Category and account filters
- **Export Options**: PDF, Excel (XLSX), and CSV formats
- Saved reports list with pagination
- Report preview capability
- Scheduled report generation

### Swagger API Documentation

![Swagger UI Screenshot](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/swagger-ui-screenshot.png)

Complete interactive API documentation featuring:
- **Organized Endpoints**: Grouped by functionality (Authentication, Transactions, Categories, etc.)
- **Interactive Testing**: Try out API calls directly from the interface
- **Authentication Integration**:
  - Authorize button for JWT token input
  - Automatic header injection for authenticated requests
- **Schema Definitions**: Detailed request/response models
- **HTTP Status Codes**: Comprehensive error handling documentation
- **Example Requests**: Pre-filled with sample data
- **OpenAPI 3.0 Specification**: Industry-standard documentation format
- **Server Selection**: Toggle between development and production environments

### Development Flow Screenshots

#### Dashboard - Goal Issue Resolution

![Dashboard Goal Issue](https://raw.githubusercontent.com/Thiago-Cardoso/finance-app/master/screen/dashboard-goal-issue.png)

Example of the AI-assisted debugging process:
- Real-time issue identification using IDE MCP
- Visual feedback on component rendering problems
- Quick iteration and testing cycle
- Immediate fix validation with Playwright MCP

This screenshot demonstrates how the AI-powered development workflow handles issues:
1. Issue detected during testing
2. Automated diagnosis using integrated tools
3. Fix applied with validation
4. Visual confirmation of resolution

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