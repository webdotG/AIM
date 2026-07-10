import { apiClient } from '../../adapters/config';

export class AnalyticsAPIClient {
  async getProfile() {
    const response = await apiClient.get('/analytics/profile');
    return response;
  }

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

  async getEmotionTimeline(granularity = 'day') {
    const response = await apiClient.get('/analytics/emotion-timeline', { params: { granularity } });
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

  async getNodeConnections(limit = 10) {
    const response = await apiClient.get('/analytics/node-connections', { params: { limit } });
    return response;
  }
}