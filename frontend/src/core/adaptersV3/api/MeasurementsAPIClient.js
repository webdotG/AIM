import { apiClient } from '../../adapters/config';

export class MeasurementsAPIClient {
  async create(nodeId, data) {
    const response = await apiClient.post(`/measurements/node/${nodeId}`, data);
    return response;
  }

  async getByNode(nodeId) {
    const response = await apiClient.get(`/measurements/node/${nodeId}`);
    return response;
  }

  async deleteByNode(nodeId) {
    const response = await apiClient.delete(`/measurements/node/${nodeId}`);
    return response;
  }
}