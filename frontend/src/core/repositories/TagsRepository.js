import { BaseRepository } from './base/BaseRepository';

export class TagsRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async create(name) {
    throw new Error('Not implemented');
  }

  async update(id, name) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  // Для записей
  async getForEntry(entryId) {
    throw new Error('Not implemented');
  }

  async attachToEntry(entryId, tagIds) {
    throw new Error('Not implemented');
  }

  async detachFromEntry(entryId) {
    throw new Error('Not implemented');
  }

  // Утилиты
  async findOrCreate(name) {
    throw new Error('Not implemented');
  }

  async getMostUsed(limit = 20) {
    throw new Error('Not implemented');
  }

  async getUnused() {
    throw new Error('Not implemented');
  }

  async getSimilar(id, limit = 5) {
    throw new Error('Not implemented');
  }

  async getEntriesByTag(id, limit = 50) {
    throw new Error('Not implemented');
  }
}
