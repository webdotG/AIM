import { makeAutoObservable, runInAction } from 'mobx';
import { AnalyticsAPIClient } from '@/core/adaptersV3/api/AnalyticsAPIClient';

export class AnalyticsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.api = new AnalyticsAPIClient();
    makeAutoObservable(this);
  }

  profile = null;
  stats = null;
  entriesByMonth = null;
  emotionDistribution = null;
  emotionTimeline = null;
  activityHeatmap = null;
  streaks = null;
  nodeConnections = null;
  isLoading = false;
  error = null;

  async fetchProfile() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getProfile();
      runInAction(() => {
        if (response && response.success) {
          this.profile = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch profile';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchStats() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getStats();
      runInAction(() => {
        if (response && response.success) {
          this.stats = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch stats';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchEntriesByMonth(months = 12) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getEntriesByMonth(months);
      runInAction(() => {
        if (response && response.success) {
          this.entriesByMonth = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch entries-by-month';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchEmotionDistribution() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getEmotionDistribution();
      runInAction(() => {
        if (response && response.success) {
          this.emotionDistribution = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch emotion distribution';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchEmotionTimeline(granularity = 'day') {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getEmotionTimeline(granularity);
      runInAction(() => {
        if (response && response.success) {
          this.emotionTimeline = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch emotion timeline';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchActivityHeatmap(year) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getActivityHeatmap(year);
      runInAction(() => {
        if (response && response.success) {
          this.activityHeatmap = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch activity heatmap';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchStreaks() {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getStreaks();
      runInAction(() => {
        if (response && response.success) {
          this.streaks = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch streaks';
        this.isLoading = false;
      });
      throw e;
    }
  }

  async fetchNodeConnections(limit = 10) {
    this.isLoading = true;
    this.error = null;
    try {
      const response = await this.api.getNodeConnections(limit);
      runInAction(() => {
        if (response && response.success) {
          this.nodeConnections = response.data;
        }
        this.isLoading = false;
      });
    } catch (e) {
      runInAction(() => {
        this.error = e.message || 'Failed to fetch node connections';
        this.isLoading = false;
      });
      throw e;
    }
  }
}