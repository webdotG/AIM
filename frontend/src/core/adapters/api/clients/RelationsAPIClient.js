// ~/aProject/AIM/frontend/src/core/adapters/api/clients/RelationsAPIClient.js

import { apiClient } from '../../config';

export class RelationsAPIClient {
  async getTypes() {
    const response = await apiClient.get('/relations/types');
    return response;
  }

  async create(relationData) {
    const response = await apiClient.post('/relations', relationData);
    return response;
  }

  async getEntryRelations(entryId) {
    const response = await apiClient.get(`/relations/entry/${entryId}`);
    return response;
  }

  async getMostConnected(limit = 10) {
    const response = await apiClient.get('/relations/most-connected', { params: { limit } });
    return response;
  }

  async delete(id) {
    await apiClient.delete(`/relations/${id}`);
    return true;
  }
}