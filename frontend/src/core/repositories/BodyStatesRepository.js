import { BaseRepository } from './base/BaseRepository';

export class BodyStatesRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async create(bodyStateData) {
    throw new Error('Not implemented');
  }

  async update(id, bodyStateData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }
}