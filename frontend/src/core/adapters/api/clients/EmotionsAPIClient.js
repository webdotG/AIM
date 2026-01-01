// ~/aProject/AIM/frontend/src/core/adapters/api/clients/EmotionsAPIClient.js

import { apiClient } from '../../config';

export class EmotionsAPIClient {
  async getAll() {
    const response = await apiClient.get('/emotions');
    return response;
  }

  async getByCategory(category) {
    const response = await apiClient.get(`/emotions/category/${category}`);
    return response;
  }

  async attachToEntry(entryId, emotions) {
    const response = await apiClient.post(`/emotions/entry/${entryId}`, { emotions });
    return response;
  }

  async getEntryEmotions(entryId) {
    const response = await apiClient.get(`/emotions/entry/${entryId}`);
    return response;
  }

  async deleteEntryEmotions(entryId) {
    await apiClient.delete(`/emotions/entry/${entryId}`);
    return true;
  }

  async getStats() {
    const response = await apiClient.get('/emotions/stats');
    return response;
  }

  async getMostFrequent(limit = 10) {
    const response = await apiClient.get('/emotions/most-frequent', { params: { limit } });
    return response;
  }
}