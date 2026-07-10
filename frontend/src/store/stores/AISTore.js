import { makeAutoObservable, runInAction } from 'mobx';
import { AIAPIClient } from '@/core/adaptersV3/api/AIAPIClient';
import { AIAnalysis } from '@/core/entitiesV3/AIAnalysis';
import { AIImage } from '@/core/entitiesV3/AIImage';

export class AIStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.api = new AIAPIClient();
    makeAutoObservable(this);

    this.analysisCache = {};
    this.imageCache = {};
    this.loading = {};
    this.error = null;
  }

  // Analysis
  async requestAnalysis(nodeId, data) {
    this.loading[`analysis_${nodeId}`] = true;
    try {
      const response = await this.api.requestAnalysis(nodeId, data);
      runInAction(() => {
        if (response && response.success) {
          this.analysisCache[nodeId] = this.analysisCache[nodeId] || [];
          this.analysisCache[nodeId].push(new AIAnalysis(response.data));
        }
        this.loading[`analysis_${nodeId}`] = false;
      });
      return this.analysisCache[nodeId];
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to request analysis';
        this.loading[`analysis_${nodeId}`] = false;
      });
      throw e;
    }
  }

  async getAnalysis(nodeId) {
    if (this.analysisCache[nodeId]) {
      return this.analysisCache[nodeId];
    }

    this.loading[`analysis_${nodeId}`] = true;
    try {
      const response = await this.api.getAnalysis(nodeId);
      runInAction(() => {
        if (response && response.success) {
          this.analysisCache[nodeId] = response.data.map(d => new AIAnalysis(d));
        }
        this.loading[`analysis_${nodeId}`] = false;
      });
      return this.analysisCache[nodeId];
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to get analysis';
        this.loading[`analysis_${nodeId}`] = false;
      });
      throw e;
    }
  }

  // Image
  async requestImage(nodeId, data) {
    this.loading[`image_${nodeId}`] = true;
    try {
      const response = await this.api.requestImage(nodeId, data);
      runInAction(() => {
        if (response && response.success) {
          this.imageCache[nodeId] = this.imageCache[nodeId] || [];
          this.imageCache[nodeId].push(new AIImage(response.data));
        }
        this.loading[`image_${nodeId}`] = false;
      });
      return this.imageCache[nodeId];
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to request image';
        this.loading[`image_${nodeId}`] = false;
      });
      throw e;
    }
  }

  async getImages(nodeId) {
    if (this.imageCache[nodeId]) {
      return this.imageCache[nodeId];
    }

    this.loading[`image_${nodeId}`] = true;
    try {
      const response = await this.api.getImages(nodeId);
      runInAction(() => {
        if (response && response.success) {
          this.imageCache[nodeId] = response.data.map(d => new AIImage(d));
        }
        this.loading[`image_${nodeId}`] = false;
      });
      return this.imageCache[nodeId];
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to get images';
        this.loading[`image_${nodeId}`] = false;
      });
      throw e;
    }
  }

  clearCache(nodeId) {
    if (nodeId) {
      delete this.analysisCache[nodeId];
      delete this.imageCache[nodeId];
      delete this.loading[`analysis_${nodeId}`];
      delete this.loading[`image_${nodeId}`];
    } else {
      this.analysisCache = {};
      this.imageCache = {};
      this.loading = {};
    }
  }
}