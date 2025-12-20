import { BaseRepository } from './base/BaseRepository';

export class SkillsRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async create(skillData) {
    throw new Error('Not implemented');
  }

  async update(id, skillData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  // Специфичные методы
  async addProgress(skillId, progressData) {
    throw new Error('Not implemented');
  }

  async getProgressHistory(skillId) {
    throw new Error('Not implemented');
  }

  async getCategories() {
    throw new Error('Not implemented');
  }

  async getTopSkills(limit = 10) {
    throw new Error('Not implemented');
  }
}
