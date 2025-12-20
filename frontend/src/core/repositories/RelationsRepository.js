export class RelationsRepository {
  async getForEntry(entryId) {
    throw new Error('Not implemented');
  }

  async create(relationData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  // Граф
  async getChain(entryId, params = {}) {
    throw new Error('Not implemented');
  }

  async getGraph(entryId) {
    throw new Error('Not implemented');
  }

  // Справочник
  async getTypes() {
    throw new Error('Not implemented');
  }

  async getMostConnected(limit = 10) {
    throw new Error('Not implemented');
  }
}