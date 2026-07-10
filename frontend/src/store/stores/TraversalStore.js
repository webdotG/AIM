import { makeAutoObservable, runInAction } from 'mobx';
import { EdgesAPIClient } from '@/core/adaptersV3/api/EdgesAPIClient';
import { EdgeMapper } from '@/core/mappersV3/EdgeMapper';
import { NodeMapper } from '@/core/mappersV3/NodeMapper';

export class TraversalStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.api = new EdgesAPIClient();
    makeAutoObservable(this);
  }

  graphData = { nodes: [], edges: [] };
  traversalResult = { path: [], edges: [] };
  isLoading = false;
  error = null;

  // Load full graph-data
  async loadGraph() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getGraphData();
      runInAction(() => {
        if (response.success) {
          this.graphData = {
            nodes: NodeMapper.toDomainArray(response.data.nodes),
            edges: EdgeMapper.toDomainArray(response.data.edges),
          };
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to load graph';
        this.isLoading = false;
      });
      throw e;
    }
  }

  // Traverse from a specific
  async traverse(nodeId, params) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.traverse(nodeId, params);
      runInAction(() => {
        if (response.success) {
          this.traversalResult = {
            path: response.data.path,
            edges: response.data.edges,
          };
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to traverse';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async getMostConnected(limit = 5) {
    const response = await this.api.getMostConnected(limit);
    return response;
  }
}