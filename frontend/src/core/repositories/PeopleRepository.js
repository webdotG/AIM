import { BaseRepository } from './base/BaseRepository';

export class PeopleRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }

  async create(personData) {
    throw new Error('Not implemented');
  }

  async update(id, personData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async getMostMentioned(limit = 10) {
    throw new Error('Not implemented');
  }
}