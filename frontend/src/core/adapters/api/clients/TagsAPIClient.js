// ~/aProject/AIM/frontend/src/core/adapters/api/clients/TagsAPIClient.js

import { apiClient } from '../../config';

export class TagsAPIClient {
  async getAll() {
    const response = await apiClient.get('/tags');
    return response;
  }

  async getById(id) {
    const response = await apiClient.get(`/tags/${id}`);
    return response;
  }

  async create(tagData) {
    const response = await apiClient.post('/tags', tagData);
    return response;
  }

  async update(id, tagData) {
    const response = await apiClient.put(`/tags/${id}`, tagData);
    return response;
  }

  async delete(id) {
    await apiClient.delete(`/tags/${id}`);
    return true;
  }
}