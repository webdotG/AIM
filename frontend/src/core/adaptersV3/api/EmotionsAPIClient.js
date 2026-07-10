import { apiClient } from '../../adapters/config';

export class EmotionsAPIClient {
  async getAll() {
    const response = await apiClient.get('/emotions');
    return response;
  }

  async getByCategory(category) {
    const response = await apiClient.get(`/emotions/category/${category}`);
    return response;
  }

  async replaceNodeEmotions(nodeId, emotions) {
    const response = await apiClient.put(`/emotions/node/${nodeId}`, { emotions });
    return response;
  }

  async getStats() {
    const response = await apiClient.get('/emotions/stats');
    return response;
  }

  async getMostFrequent(limit = 10) {
    const response = await apiClient.get('/emotions/most-frequent', { params: { limit } });
    return response;
  }

  async getTimeline(granularity = 'day') {
    const response = await apiClient.get('/emotions/timeline', { params: { granularity } });
    return response;
  }
}