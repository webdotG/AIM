import { apiClient } from '../../adapters/config';

export class PeopleAPIClient {
  async getAll(filters = {}) {
    const response = await apiClient.get('/people', { params: filters });
    return response;
  }

  async getById(id) {
    const response = await apiClient.get(`/people/${id}`);
    return response;
  }

  async getMostMentioned(limit = 5) {
    const response = await apiClient.get('/people/most-mentioned', { params: { limit } });
    return response;
  }

  async getContacts(id) {
    const response = await apiClient.get(`/people/${id}/contacts`);
    return response;
  }

  async create(data) {
    const response = await apiClient.post('/people', data);
    return response;
  }

  async update(id, data) {
    const response = await apiClient.put(`/people/${id}`, data);
    return response;
  }

  async delete(id) {
    const response = await apiClient.delete(`/people/${id}`);
    return response;
  }
}