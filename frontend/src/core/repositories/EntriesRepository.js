import { BaseRepository } from './base/BaseRepository';

export class EntriesRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async create(entryData) {
    throw new Error('Not implemented');
  }

  async update(id, entryData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async search(query, limit = 20) {
    throw new Error('Not implemented');
  }
}