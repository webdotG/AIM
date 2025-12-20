import { apiClient } from '../../config';
import { BodyStatesRepository } from '../../../repositories/BodyStatesRepository';
import { BodyStateMapper } from '../mappers/BodyStateMapper';

export class BodyStatesAPIClient extends BodyStatesRepository {
  async getAll(filters = {}) {
    const response = await apiClient.get('/body-states', { params: filters });
    return {
      bodyStates: BodyStateMapper.toDomainArray(response.data.bodyStates),
      pagination: response.data.pagination,
    };
  }

  async getById(id) {
    const response = await apiClient.get(`/body-states/${id}`);
    return BodyStateMapper.toDomain(response.data);
  }

  async create(bodyStateData) {
    const dto = BodyStateMapper.toDTO(bodyStateData);
    const response = await apiClient.post('/body-states', dto);
    return BodyStateMapper.toDomain(response.data);
  }

  async update(id, bodyStateData) {
    const dto = BodyStateMapper.toDTO(bodyStateData);
    const response = await apiClient.put(`/body-states/${id}`, dto);
    return BodyStateMapper.toDomain(response.data);
  }

  async delete(id) {
    await apiClient.delete(`/body-states/${id}`);
    return true;
  }

  async getLatest() {
    const response = await apiClient.get('/body-states/latest');
    return BodyStateMapper.toDomain(response.data);
  }

  async getHealthStats(params = {}) {
    const response = await apiClient.get('/body-states/stats/health', { params });
    return response.data;
  }

  async getEnergyStats(params = {}) {
    const response = await apiClient.get('/body-states/stats/energy', { params });
    return response.data;
  }
}