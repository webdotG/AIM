import { makeAutoObservable, runInAction } from 'mobx';
import { NodesAPIClient } from '@/core/adaptersV3/api/NodesAPIClient';
import { PeopleAPIClient } from '@/core/adaptersV3/api/PeopleAPIClient';
import { NodeMapper } from '@/core/mappersV3/NodeMapper';

export class NodeStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.api = new NodesAPIClient();
    this.peopleApi = new PeopleAPIClient();
    makeAutoObservable(this);
  }

  nodes = [];
  currentNode = null;
  isLoading = false;
  error = null;
  pagination = null;
  nodeTypes = [];
  edgeTypes = [];

  // Fetch all nodes (from /graph/nodes)
  async fetchNodes(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getAll(filters);
      runInAction(() => {
        if (response.success) {
          this.nodes = response.data.data.map(d => NodeMapper.toDomain(d));
          this.pagination = response.data.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch nodes';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Fetch single node by ID
  async fetchNodeById(id) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getById(id);
      runInAction(() => {
        if (response.success) {
          this.currentNode = NodeMapper.toDomain(response.data.node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch node';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Create a node
  async createNode(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.create(data);
      runInAction(() => {
        if (response.success) {
          const node = NodeMapper.toDomain(response.data);
          this.nodes.unshift(node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create node';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Update a node
  async updateNode(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.update(id, data);
      runInAction(() => {
        if (response.success) {
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = NodeMapper.toDomain(response.data);
          if (this.currentNode?.id === id) this.currentNode = NodeMapper.toDomain(response.data);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update node';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Soft delete (archive) a node
  async deleteNode(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.delete(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete node';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Restore a soft-deleted node
  async restoreNode(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.restore(id);
      this.isLoading = false;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to restore node';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Fetch node types
  async fetchNodeTypes() {
    try {
      const response = await this.api.getNodeTypes();
      if (response.success) {
        this.nodeTypes = response.data;
      }
    } catch (e) {
      this.error = e.message || 'Failed to fetch node types';
    }
  }

  // Fetch edge types
  async fetchEdgeTypes() {
    try {
      const response = await this.api.getEdgeTypes();
      if (response.success) {
        this.edgeTypes = response.data;
      }
    } catch (e) {
      this.error = e.message || 'Failed to fetch edge types';
    }
  }

  // Specialized fetchers — delegates to NodesAPIClient
  async fetchDreams(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.fetchDreams(filters);
      runInAction(() => {
        if (response.success) {
          this.nodes = response.data.data.map(d => NodeMapper.toDomain(d));
          this.pagination = response.data.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch dreams';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async createDream(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.createDream(data);
      runInAction(() => {
        if (response.success) {
          const node = NodeMapper.toDomain(response.data.node);
          this.nodes.unshift(node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create dream';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async updateDream(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.updateDream(id, data);
      runInAction(() => {
        if (response.success) {
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = NodeMapper.toDomain(response.data.node);
          if (this.currentNode?.id === id) this.currentNode = NodeMapper.toDomain(response.data.node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update dream';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async deleteDream(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.deleteDream(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete dream';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchThoughts(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.fetchThoughts(filters);
      runInAction(() => {
        if (response.success) {
          this.nodes = response.data.data.map(d => NodeMapper.toDomain(d));
          this.pagination = response.data.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch thoughts';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async createThought(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.createThought(data);
      runInAction(() => {
        if (response.success) {
          const node = NodeMapper.toDomain(response.data.node);
          this.nodes.unshift(node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create thought';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async updateThought(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.updateThought(id, data);
      runInAction(() => {
        if (response.success) {
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = NodeMapper.toDomain(response.data.node);
          if (this.currentNode?.id === id) this.currentNode = NodeMapper.toDomain(response.data.node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update thought';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async deleteThought(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.deleteThought(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete thought';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchMemories(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.fetchMemories(filters);
      runInAction(() => {
        if (response.success) {
          this.nodes = response.data.data.map(d => NodeMapper.toDomain(d));
          this.pagination = response.data.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch memories';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async createMemory(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.createMemory(data);
      runInAction(() => {
        if (response.success) {
          const node = NodeMapper.toDomain(response.data.node);
          this.nodes.unshift(node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create memory';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async updateMemory(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.updateMemory(id, data);
      runInAction(() => {
        if (response.success) {
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = NodeMapper.toDomain(response.data.node);
          if (this.currentNode?.id === id) this.currentNode = NodeMapper.toDomain(response.data.node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update memory';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async deleteMemory(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.deleteMemory(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete memory';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchPlans(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.fetchPlans(filters);
      runInAction(() => {
        if (response.success) {
          this.nodes = response.data.data.map(d => NodeMapper.toDomain(d));
          this.pagination = response.data.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch plans';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async createPlan(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.createPlan(data);
      runInAction(() => {
        if (response.success) {
          const node = NodeMapper.toDomain(response.data.node);
          this.nodes.unshift(node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create plan';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async updatePlan(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.updatePlan(id, data);
      runInAction(() => {
        if (response.success) {
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = NodeMapper.toDomain(response.data.node);
          if (this.currentNode?.id === id) this.currentNode = NodeMapper.toDomain(response.data.node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update plan';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async deletePlan(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.deletePlan(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete plan';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchActions(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.fetchActions(filters);
      runInAction(() => {
        if (response.success) {
          this.nodes = response.data.data.map(d => NodeMapper.toDomain(d));
          this.pagination = response.data.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch actions';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async createAction(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.createAction(data);
      runInAction(() => {
        if (response.success) {
          const node = NodeMapper.toDomain(response.data.node);
          this.nodes.unshift(node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create action';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async updateAction(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.updateAction(id, data);
      runInAction(() => {
        if (response.success) {
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = NodeMapper.toDomain(response.data.node);
          if (this.currentNode?.id === id) this.currentNode = NodeMapper.toDomain(response.data.node);
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update action';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async deleteAction(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.deleteAction(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete action';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchPeople(filters = {}) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.peopleApi.getAll(filters);
      runInAction(() => {
        if (response && response.success) {
          this.nodes = response.data?.data?.map(d => NodeMapper.toDomain(d)) || [];
          this.pagination = response.data?.pagination;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch people';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async createPerson(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.peopleApi.create(data);
      runInAction(() => {
        if (response && response.success) {
          const personData = response.data?.node || response.data;
          const node = NodeMapper.toDomain(personData);
          this.nodes.unshift(node);
          this.currentNode = node;
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create person';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async updatePerson(id, data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.peopleApi.update(id, data);
      runInAction(() => {
        if (response && response.success) {
          const personData = response.data?.node || response.data;
          const node = NodeMapper.toDomain(personData);
          const idx = this.nodes.findIndex(n => n.id === id);
          if (idx !== -1) this.nodes[idx] = node;
          if (this.currentNode?.id === id) this.currentNode = node;
        }
        this.isLoading = false;
      });
      return this.currentNode;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to update person';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async deletePerson(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.peopleApi.delete(id);
      runInAction(() => {
        this.nodes = this.nodes.filter(n => n.id !== id);
        if (this.currentNode?.id === id) this.currentNode = null;
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete person';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async getMostMentionedPeople(limit = 5) {
    const response = await this.peopleApi.getMostMentioned(limit);
    return response;
  }

  async getPersonContacts(id) {
    const response = await this.peopleApi.getContacts(id);
    return response;
  }

  async getMostConnected(limit = 5) {
    const response = await this.api.getMostConnected(limit);
    return response;
  }

  // Computed helpers
  get dreamNodes() {
    return this.nodes.filter(n => n.nodeTypeCode === 'dream');
  }

  get thoughtNodes() {
    return this.nodes.filter(n => n.nodeTypeCode === 'thought');
  }

  get memoryNodes() {
    return this.nodes.filter(n => n.nodeTypeCode === 'memory');
  }

  get planNodes() {
    return this.nodes.filter(n => n.nodeTypeCode === 'plan');
  }

  get actionNodes() {
    return this.nodes.filter(n => n.nodeTypeCode === 'action');
  }

  get overduePlans() {
    return this.nodes.filter((n) => {
      if (n.nodeTypeCode !== 'plan' || !n.deadline) return false;
      return new Date(n.deadline) < new Date() && !n.isCompleted;
    });
  }
}