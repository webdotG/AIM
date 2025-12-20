export class BaseRepository {
  async getAll(filters = {}) {
    throw new Error('getAll() must be implemented');
  }

  async getById(id) {
    throw new Error('getById() must be implemented');
  }

  async create(data) {
    throw new Error('create() must be implemented');
  }

  async update(id, data) {
    throw new Error('update() must be implemented');
  }

  async delete(id) {
    throw new Error('delete() must be implemented');
  }
}