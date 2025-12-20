import { apiClient } from '../../config';
import { CircumstancesRepository } from '../../../repositories/CircumstancesRepository';
import { CircumstanceMapper } from '../mappers/CircumstanceMapper';

export class CircumstancesAPIClient extends CircumstancesRepository {
  async getAll(filters = {}) {
    const response = await apiClient.get('/circumstances', { params: filters });
    return {
      circumstances: CircumstanceMapper.toDomainArray(response.data.circumstances),
      pagination: response.data.pagination,
    };
  }

  async getById(id) {
    const response = await apiClient.get(`/circumstances/${id}`);
    return CircumstanceMapper.toDomain(response.data);
  }

  async create(circumstanceData) {
    const dto = CircumstanceMapper.toDTO(circumstanceData);
    const response = await apiClient.post('/circumstances', dto);
    return CircumstanceMapper.toDomain(response.data);
  }

  async update(id, circumstanceData) {
    const dto = CircumstanceMapper.toDTO(circumstanceData);
    const response = await apiClient.put(`/circumstances/${id}`, dto);
    return CircumstanceMapper.toDomain(response.data);
  }

  async delete(id) {
    await apiClient.delete(`/circumstances/${id}`);
    return true;
  }

  async getWeatherStats(params = {}) {
    const response = await apiClient.get('/circumstances/stats/weather', { params });
    return response.data;
  }

  async getMoonPhaseStats(params = {}) {
    const response = await apiClient.get('/circumstances/stats/moon-phase', { params });
    return response.data;
  }

  async getLatest() {
    const response = await apiClient.get('/circumstances/latest');
    return CircumstanceMapper.toDomain(response.data);
  }
}