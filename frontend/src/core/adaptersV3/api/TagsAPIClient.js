import { apiClient } from '../../adapters/config';

export class TagsAPIClient {
  async getAll(params = {}) {
    const response = await apiClient.get('/tags', { params });
    return response;
  }

  async getById(id) {
    const response = await apiClient.get(`/tags/${id}`);
    return response;
  }

  async getMostUsed(params = {}) {
    const response = await apiClient.get('/tags/most-used', { params });
    return response;
  }

  async getUnused() {
    const response = await apiClient.get('/tags/unused');
    return response;
  }

  async getNodes(tagId) {
    const response = await apiClient.get(`/tags/${tagId}/nodes`);
    return response;
  }

  async create(data) {
    const response = await apiClient.post('/tags', data);
    return response;
  }

  async findOrCreate(data) {
    const response = await apiClient.post('/tags/find-or-create', data);
    return response;
  }

  async updateName(id, name) {
    const response = await apiClient.put(`/tags/${id}/name`, { name });
    return response;
  }

  async delete(id) {
    const response = await apiClient.delete(`/tags/${id}`);
    return response;
  }

  async getByNode(nodeId) {
    const response = await apiClient.get(`/tags/node/${nodeId}`);
    return response;
  }

  async setNodeTags(nodeId, tagIds) {
    const response = await apiClient.put(`/tags/node/${nodeId}`, { tag_ids: tagIds });
    return response;
  }
}