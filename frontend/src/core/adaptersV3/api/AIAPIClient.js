import { apiClient } from '../../adapters/config';

export class AIAPIClient {
  async requestAnalysis(nodeId, data) {
    const response = await apiClient.post(`/ai/analysis/${nodeId}`, data);
    return response;
  }

  async getAnalysis(nodeId) {
    const response = await apiClient.get(`/ai/analysis/${nodeId}`);
    return response;
  }

  async requestImage(nodeId, data) {
    const response = await apiClient.post(`/ai/image/${nodeId}`, data);
    return response;
  }

  async getImages(nodeId) {
    const response = await apiClient.get(`/ai/image/${nodeId}`);
    return response;
  }
}