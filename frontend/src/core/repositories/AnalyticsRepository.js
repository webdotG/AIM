import { BaseRepository } from "./base/BaseRepository";

export class AnalyticsRepository extends BaseRepository {
  async getOverallStats() {
    throw new Error('Not implemented');
  }

  async getEntriesByMonth(months = 12) {
    throw new Error('Not implemented');
  }

  async getEmotionDistribution(params = {}) {
    throw new Error('Not implemented');
  }

  async getActivityHeatmap(year) {
    throw new Error('Not implemented');
  }

  async getStreaks() {
    throw new Error('Not implemented');
  }
}