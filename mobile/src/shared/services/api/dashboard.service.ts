/**
 * Dashboard Service
 *
 * Service to fetch consolidated dashboard data.
 */

import { apiClient } from './client';
import type { DashboardApiResponse } from '@/shared/models/Dashboard.model';

/**
 * Fetch dashboard data
 * @param period - Data period (this_month, last_month, this_year, etc)
 */
export async function getDashboardData(period = 'this_month'): Promise<DashboardApiResponse> {
  try {
    const response = await apiClient.get<{ data: DashboardApiResponse }>('/api/v1/dashboard', {
      params: { period },
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}
