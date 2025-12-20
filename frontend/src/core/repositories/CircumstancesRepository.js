import { BaseRepository } from './base/BaseRepository';

export class CircumstancesRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async create(circumstanceData) {
    throw new Error('Not implemented');
  }

  async update(id, circumstanceData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  // Специфичные методы
  async getWeatherStats(params = {}) {
    throw new Error('Not implemented');
  }

  async getMoonPhaseStats(params = {}) {
    throw new Error('Not implemented');
  }
}