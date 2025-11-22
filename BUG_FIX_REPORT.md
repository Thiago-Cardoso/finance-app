# Bug Fix Report - Goals 500 Error

**Date:** 2025-10-28
**Fixed by:** Claude Code
**Session:** Continuation from test fixing work

## Problem Description

When attempting to list goals via GET `/api/v1/goals`, the application was returning a 500 Internal Server Error. The frontend displayed "Erro ao carregar metas" even though goal creation was successful.

## Root Cause

The `GoalsController#index` action (app/controllers/api/v1/goals_controller.rb:11-29) was calling the `is_on_track?` method on Goal models (lines 25 and 42), but this method did not exist in the Goal model (app/models/goal.rb).

### Error Details
```
NoMethodError: undefined method `is_on_track?' for #<Goal id: 3, name: "Viagem de Férias", ...>
```

## Solution

Added the missing `is_on_track?` method to the Goal model (app/models/goal.rb:97-108):

```ruby
def is_on_track?
  return true if days_remaining.nil? || days_remaining <= 0
  return true if progress_percentage >= 100

  # Calculate expected progress based on time elapsed
  total_days = target_date.nil? ? 1 : (target_date - created_at.to_date).to_i
  days_elapsed = total_days - days_remaining
  expected_progress = total_days.zero? ? 0 : (days_elapsed.to_f / total_days * 100)

  # Goal is on track if actual progress is within 10% of expected progress
  progress_percentage >= (expected_progress - 10)
end
```

### Method Logic

The method determines if a financial goal is "on track" by:
1. Returning `true` if the deadline has passed or the goal is completed (100%)
2. Calculating the expected progress based on time elapsed since goal creation
3. Comparing actual progress with expected progress (with 10% tolerance)
4. Returning `true` if actual progress is within 10% of expected progress

## Testing

### Manual Testing (Playwright)
1. Created test user: claude@test.com
2. Created goal: "Viagem de Férias" - R$ 50.00, target date: 2025-12-31
3. Verified goals page loads correctly showing:
   - Total de Metas: 1
   - Metas Ativas: 1
   - Goal details: Progress 0.0%, 64 days remaining
4. Screenshot saved: `.playwright-mcp/goals-page-fixed.png`

### Impact on Test Suite
- **Before fix:** Goals API would fail with 500 errors
- **After fix:** Goals listing works correctly
- **Test suite progress:** Down from 31 failures to 14 failures

## Files Modified

1. **app/models/goal.rb** (lines 97-108)
   - Added `is_on_track?` method

## Verification

```bash
# Test the endpoint directly
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/goals

# Response: 200 OK with goal data including is_on_track field
```

## Related Issues

This fix addresses the user's reported issue: "use o mcp do playwrite e ajuste o erro na tela of goals... nao carrega as metas"

The goals page now loads successfully and displays all goal information correctly.
