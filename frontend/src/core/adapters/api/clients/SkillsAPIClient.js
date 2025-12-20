import { apiClient } from '../../config';
import { SkillsRepository } from '../../../repositories/SkillsRepository';
import { SkillMapper } from '../mappers/SkillMapper';

export class SkillsAPIClient extends SkillsRepository {
  async getAll(filters = {}) {
    const response = await apiClient.get('/skills', { params: filters });
    return {
      skills: SkillMapper.toDomainArray(response.data.skills),
      pagination: response.data.pagination,
    };
  }

  async getById(id) {
    const response = await apiClient.get(`/skills/${id}`);
    return SkillMapper.toDomain(response.data);
  }

  async create(skillData) {
    const dto = SkillMapper.toDTO(skillData);
    const response = await apiClient.post('/skills', dto);
    return SkillMapper.toDomain(response.data);
  }

  async update(id, skillData) {
    const dto = SkillMapper.toDTO(skillData);
    const response = await apiClient.put(`/skills/${id}`, dto);
    return SkillMapper.toDomain(response.data);
  }

  async delete(id) {
    await apiClient.delete(`/skills/${id}`);
    return true;
  }

  async addProgress(skillId, progressData) {
    const response = await apiClient.post(`/skills/${skillId}/progress`, progressData);
    return SkillMapper.toDomain(response.data);
  }

  async getProgressHistory(skillId, params = {}) {
    const response = await apiClient.get(`/skills/${skillId}/progress`, { params });
    return response.data;
  }

  async getStats(params = {}) {
    const response = await apiClient.get('/skills/stats', { params });
    return response.data;
  }
}