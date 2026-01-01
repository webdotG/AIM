// ~/aProject/AIM/frontend/src/core/adapters/api/clients/AnalyticsAPIClient.js

import { apiClient } from '../../config';

export class AnalyticsAPIClient {
  async getStats() {
    const response = await apiClient.get('/analytics/stats');
    return response;
  }

  async getEntriesByMonth(months = 12) {
    const response = await apiClient.get('/analytics/entries-by-month', { params: { months } });
    return response;
  }

  async getEmotionDistribution() {
    const response = await apiClient.get('/analytics/emotion-distribution');
    return response;
  }

  async getActivityHeatmap(year) {
    const params = year ? { year } : {};
    const response = await apiClient.get('/analytics/activity-heatmap', { params });
    return response;
  }

  async getStreaks() {
    const response = await apiClient.get('/analytics/streaks');
    return response;
  }
}