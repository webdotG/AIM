import { apiClient } from '../../adapters/config';

export class NodesAPIClient {
  // Core Node CRUD — works with /graph/nodes
  async getAll(filters = {}) {
    const response = await apiClient.get('/graph/nodes', { params: filters });
    return response;
  }

  async getById(id) {
    const response = await apiClient.get(`/graph/nodes/${id}`);
    return response;
  }

  async create(data) {
    const response = await apiClient.post('/graph/nodes', data);
    return response;
  }

  async update(id, data) {
    const response = await apiClient.put(`/graph/nodes/${id}`, data);
    return response;
  }

  async delete(id) {
    const response = await apiClient.delete(`/graph/nodes/${id}`);
    return response;
  }

  async restore(id) {
    const response = await apiClient.post(`/graph/nodes/${id}/restore`);
    return response;
  }

  async getNodeTypes() {
    const response = await apiClient.get('/graph/node-types');
    return response;
  }

  async getEdgeTypes() {
    const response = await apiClient.get('/graph/edge-types');
    return response;
  }

  // Specialized type endpoints — backend has separate CRUD per type
  async fetchDreams(filters = {}) {
    const response = await apiClient.get('/dreams', { params: filters });
    return response;
  }

  async createDream(data) {
    const response = await apiClient.post('/dreams', data);
    return response;
  }

  async updateDream(id, data) {
    const response = await apiClient.put(`/dreams/${id}`, data);
    return response;
  }

  async deleteDream(id) {
    const response = await apiClient.delete(`/dreams/${id}`);
    return response;
  }

  async fetchThoughts(filters = {}) {
    const response = await apiClient.get('/thoughts', { params: filters });
    return response;
  }

  async createThought(data) {
    const response = await apiClient.post('/thoughts', data);
    return response;
  }

  async updateThought(id, data) {
    const response = await apiClient.put(`/thoughts/${id}`, data);
    return response;
  }

  async deleteThought(id) {
    const response = await apiClient.delete(`/thoughts/${id}`);
    return response;
  }

  async fetchMemories(filters = {}) {
    const response = await apiClient.get('/memories', { params: filters });
    return response;
  }

  async createMemory(data) {
    const response = await apiClient.post('/memories', data);
    return response;
  }

  async updateMemory(id, data) {
    const response = await apiClient.put(`/memories/${id}`, data);
    return response;
  }

  async deleteMemory(id) {
    const response = await apiClient.delete(`/memories/${id}`);
    return response;
  }

  async fetchPlans(filters = {}) {
    const response = await apiClient.get('/plans', { params: filters });
    return response;
  }

  async createPlan(data) {
    const response = await apiClient.post('/plans', data);
    return response;
  }

  async updatePlan(id, data) {
    const response = await apiClient.put(`/plans/${id}`, data);
    return response;
  }

  async deletePlan(id) {
    const response = await apiClient.delete(`/plans/${id}`);
    return response;
  }

  async fetchActions(filters = {}) {
    const response = await apiClient.get('/actions', { params: filters });
    return response;
  }

  async createAction(data) {
    const response = await apiClient.post('/actions', data);
    return response;
  }

  async updateAction(id, data) {
    const response = await apiClient.put(`/actions/${id}`, data);
    return response;
  }

  async deleteAction(id) {
    const response = await apiClient.delete(`/actions/${id}`);
    return response;
  }

  async fetchPeople(filters = {}) {
    const response = await apiClient.get('/people', { params: filters });
    return response;
  }

  async createPerson(data) {
    const response = await apiClient.post('/people', data);
    return response;
  }

  async updatePerson(id, data) {
    const response = await apiClient.put(`/people/${id}`, data);
    return response;
  }

  async deletePerson(id) {
    const response = await apiClient.delete(`/people/${id}`);
    return response;
  }

  async getMostMentionedPeople(limit = 5) {
    const response = await apiClient.get('/people/most-mentioned', { params: { limit } });
    return response;
  }

  async getPersonContacts(id) {
    const response = await apiClient.get(`/people/${id}/contacts`);
    return response;
  }

  async getMostConnected(limit = 5) {
    const response = await apiClient.get('/graph/most-connected', { params: { limit } });
    return response;
  }
}