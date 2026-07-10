import { makeAutoObservable, runInAction } from 'mobx';
import { EdgesAPIClient } from '@/core/adaptersV3/api/EdgesAPIClient';
import { EdgeMapper } from '@/core/mappersV3/EdgeMapper';

export class EdgeStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.api = new EdgesAPIClient();
    makeAutoObservable(this);
  }

  edges = [];
  isLoading = false;
  error = null;

  // Create an edge
  async createEdge(data) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.create(data);
      runInAction(() => {
        if (response.success) {
          const edge = EdgeMapper.toDomain(response.data);
          this.edges.push(edge);
        }
        this.isLoading = false;
      });
      return this.edges;
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to create edge';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Fetch edges by node
  async fetchEdgesByNode(nodeId, direction = 'both') {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.fetchByNode(nodeId, direction);
      runInAction(() => {
        if (response.success) {
          this.edges = response.data.data.map(d => EdgeMapper.toDomain(d));
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch edges';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Delete an edge
  async deleteEdge(id) {
    this.isLoading = true;
    this.error = null;
    try {
      await this.api.delete(id);
      runInAction(() => {
        this.edges = this.edges.filter(e => e.id !== id);
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to delete edge';
        this.isLoading = false;
      });
      throw e;
    }
  }
}