import { apiClient } from '../../adapters/config';

export class EdgesAPIClient {
  async create(data) {
    const response = await apiClient.post('/graph/edges', data);
    return response;
  }

  async fetchByNode(nodeId, direction = 'both') {
    const response = await apiClient.get(`/graph/edges/node/${nodeId}`, {
      params: { direction }
    });
    return response;
  }

  async delete(id) {
    const response = await apiClient.delete(`/graph/edges/${id}`);
    return response;
  }

  async traverse(nodeId, params) {
    const response = await apiClient.get(`/graph/traversal/${nodeId}`, {
      params,
    });
    return response;
  }

  async getGraphData() {
    const response = await apiClient.get('/graph/graph-data');
    return response;
  }

  async getMostConnected(limit = 5) {
    const response = await apiClient.get('/graph/most-connected', {
      params: { limit }
    });
    return response;
  }
}