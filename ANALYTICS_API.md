# Analytics and Reports API Documentation

## Overview

The Analytics API provides endpoints for generating financial reports, budget performance analytics, and exporting data in multiple formats (PDF, Excel).

## Base URL

```
http://localhost:3001/api/v1/analytics
```

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Financial Summary Report

Generates a comprehensive financial summary including income, expenses, category breakdowns, and account balances.

**Endpoint:** `GET /api/v1/analytics/financial_summary`

**Query Parameters:**
- `period_type` (optional): `daily`, `weekly`, `monthly`, `quarterly`, `yearly`, `custom_range`, `all_time`
- `start_date` (optional): Start date in format `YYYY-MM-DD`
- `end_date` (optional): End date in format `YYYY-MM-DD`
- `category_id` (optional): Filter by specific category
- `account_id` (optional): Filter by specific account

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/financial_summary?period_type=monthly" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": 1,
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31",
      "period_type": "monthly"
    },
    "summary": {
      "total_income": 5000.0,
      "total_income_formatted": "R$ 5.000,00",
      "total_expenses": 3000.0,
      "total_expenses_formatted": "R$ 3.000,00",
      "net_balance": 2000.0,
      "net_balance_formatted": "R$ 2.000,00",
      "transaction_count": 45
    },
    "income": {
      "total": 5000.0,
      "total_formatted": "R$ 5.000,00",
      "breakdown": [
        {
          "category_id": 1,
          "category_name": "Salário",
          "total": 4500.0,
          "total_formatted": "R$ 4.500,00",
          "count": 1,
          "percentage": 90.0
        }
      ]
    },
    "expenses": {
      "total": 3000.0,
      "total_formatted": "R$ 3.000,00",
      "breakdown": [
        {
          "category_id": 2,
          "category_name": "Alimentação",
          "total": 1200.0,
          "total_formatted": "R$ 1.200,00",
          "count": 15,
          "percentage": 40.0
        }
      ]
    },
    "categories": [],
    "accounts": [],
    "trends": [],
    "comparisons": {},
    "generated_at": "2025-10-12T10:30:00Z"
  }
}
```

---

### 2. Budget Performance Report

Analyzes budget performance, showing usage percentages, remaining amounts, and alerts.

**Endpoint:** `GET /api/v1/analytics/budget_performance`

**Query Parameters:**
- Same as Financial Summary endpoint

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/budget_performance?period_type=monthly" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "report_id": 2,
    "period": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-31",
      "period_type": "monthly"
    },
    "overall": {
      "total_budget": 5000.0,
      "total_budget_formatted": "R$ 5.000,00",
      "total_spent": 3200.0,
      "total_spent_formatted": "R$ 3.200,00",
      "remaining": 1800.0,
      "remaining_formatted": "R$ 1.800,00",
      "usage_percentage": 64.0,
      "status": "moderate",
      "budget_count": 5,
      "over_budget_count": 0
    },
    "budgets": [
      {
        "budget_id": 1,
        "budget_name": "Alimentação Mensal",
        "category_id": 2,
        "category_name": "Alimentação",
        "period_type": "monthly",
        "amount": 1500.0,
        "amount_formatted": "R$ 1.500,00",
        "spent": 1200.0,
        "spent_formatted": "R$ 1.200,00",
        "remaining": 300.0,
        "remaining_formatted": "R$ 300,00",
        "usage_percentage": 80.0,
        "status": "warning",
        "is_exceeded": false
      }
    ],
    "categories": [],
    "alerts": [
      {
        "type": "warning",
        "level": "high",
        "budget_id": 1,
        "budget_name": "Alimentação Mensal",
        "message": "80.0% do orçamento utilizado",
        "usage_percentage": 80.0
      }
    ],
    "generated_at": "2025-10-12T10:30:00Z"
  }
}
```

---

### 3. Export Report

Exports a report in PDF or Excel format.

**Endpoint:** `GET /api/v1/analytics/export`

**Query Parameters:**
- `report_type` (required): `financial_summary` or `budget_performance`
- `format` (optional, default: pdf): `pdf` or `excel`
- Same filter parameters as other endpoints

**Example Requests:**

Export as PDF:
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/export?report_type=financial_summary&format=pdf" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output financial_report.pdf
```

Export as Excel:
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/export?report_type=budget_performance&format=excel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output budget_report.xlsx
```

**Response:**
- Returns a binary file (PDF or Excel) with appropriate content-type headers
- Filename format: `{report_type}_{timestamp}.{extension}`

---

### 4. List Reports

Lists all generated reports for the authenticated user.

**Endpoint:** `GET /api/v1/analytics/reports`

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 20): Items per page

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/reports?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "name": "Resumo Financeiro - 01/10/2025 a 31/10/2025",
      "report_type": "financial_summary",
      "period_type": "monthly",
      "status": "completed",
      "filter_criteria": {},
      "generated_at": "2025-10-12T10:30:00Z",
      "created_at": "2025-10-12T10:29:45Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "next_page": null,
    "prev_page": null,
    "total_pages": 1,
    "total_count": 2
  }
}
```

---

### 5. Get Report Details

Retrieves details of a specific report.

**Endpoint:** `GET /api/v1/analytics/reports/:id`

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/v1/analytics/reports/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Resumo Financeiro - 01/10/2025 a 31/10/2025",
    "report_type": "financial_summary",
    "period_type": "monthly",
    "status": "completed",
    "filter_criteria": {
      "period_type": "monthly"
    },
    "generated_at": "2025-10-12T10:30:00Z",
    "created_at": "2025-10-12T10:29:45Z"
  }
}
```

---

### 6. Delete Report

Deletes a specific report.

**Endpoint:** `DELETE /api/v1/analytics/reports/:id`

**Example Request:**
```bash
curl -X DELETE "http://localhost:3001/api/v1/analytics/reports/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "You need to sign in or sign up before continuing."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Report not found"
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": "Start date must be before end date"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid report type"
}
```

---

## Report Types

### Financial Summary (`financial_summary`)
- Income and expense totals
- Category breakdowns with percentages
- Account balances
- Daily trends
- Period-over-period comparisons

### Budget Performance (`budget_performance`)
- Overall budget utilization
- Individual budget details
- Category performance
- Budget alerts and warnings
- Projected end dates

---

## Period Types

- `daily`: Current day
- `weekly`: Current week (Monday to Sunday)
- `monthly`: Current month
- `quarterly`: Current quarter
- `yearly`: Current year
- `custom_range`: Custom date range (requires `start_date` and `end_date`)
- `all_time`: All available data

---

## Caching

Reports are cached for 1 hour to improve performance. The cache key is based on:
- User ID
- Report type
- Filter parameters

To get fresh data, wait for the cache to expire or use different filter parameters.

---

## Rate Limiting

Analytics endpoints are subject to API rate limiting. Please refer to the main API documentation for rate limit details.
