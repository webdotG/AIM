import { AnalyticsRepository } from '../repositories/AnalyticsRepository';
import { Pool } from 'pg';

export class AnalyticsService {
  private analyticsRepo: AnalyticsRepository;

  constructor(pool: Pool) {
    this.analyticsRepo = new AnalyticsRepository(pool);
  }

  async getOverallStats(userId: number) {
    return this.analyticsRepo.getOverallStats(userId);
  }

  async getEntriesByMonth(userId: number, months: number = 12) {
    return this.analyticsRepo.getEntriesByMonth(userId, months);
  }

  async getEmotionDistribution(userId: number) {
    return this.analyticsRepo.getEmotionDistribution(userId);
  }

  async getActivityHeatmap(userId: number, year: number) {
    return this.analyticsRepo.getActivityHeatmap(userId, year);
  }

  async getStreaks(userId: number) {
    return this.analyticsRepo.getStreaks(userId);
  }

  async getEmotionTimeline(userId: number, granularity: 'day' | 'week' | 'month' = 'day') {
    return this.analyticsRepo.getEmotionTimeline(userId, granularity);
  }

  async getNodeConnections(userId: number) {
    return this.analyticsRepo.getNodeConnections(userId);
  }

  async getUserProfile(userId: number) {
    return this.analyticsRepo.getUserProfile(userId);
  }
}