// ~/aProject/AIM/frontend/src/core/adapters/api/clients/PeopleAPIClient.js

import { apiClient } from '../../config';

export class PeopleAPIClient {
  async getAll(filters = {}) {
    const response = await apiClient.get('/people', { params: filters });
    return response;
  }

  async getById(id) {
    const response = await apiClient.get(`/people/${id}`);
    return response;
  }

  async create(personData) {
    const response = await apiClient.post('/people', personData);
    return response;
  }

  async update(id, personData) {
    const response = await apiClient.put(`/people/${id}`, personData);
    return response;
  }

  async delete(id) {
    await apiClient.delete(`/people/${id}`);
    return true;
  }
}