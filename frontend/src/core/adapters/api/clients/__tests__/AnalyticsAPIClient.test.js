// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/AnalyticsAPIClient.test.js

import { AnalyticsAPIClient } from '../AnalyticsAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn()
  }
}));

describe('AnalyticsAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new AnalyticsAPIClient();
  });

  describe('getStats', () => {
    it('should get overall stats', async () => {
      const mockStats = {
        totalEntries: 150,
        totalDreams: 50,
        totalThoughts: 40,
        totalMemories: 30,
        totalPlans: 30,
        averageEntriesPerDay: 2.5
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/stats');
      expect(result.totalEntries).toBe(150);
      expect(result.totalDreams).toBe(50);
    });
  });

  describe('getEntriesByMonth', () => {
    it('should get entries by month', async () => {
      const mockData = [
        { month: '2024-01', count: 25 },
        { month: '2024-02', count: 30 },
        { month: '2024-03', count: 28 }
      ];
      
      mockApiClient.get.mockResolvedValue(mockData);
      
      const result = await client.getEntriesByMonth();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/entries-by-month', { params: { months: 12 } });
      expect(result).toHaveLength(3);
    });

    it('should accept months parameter', async () => {
      const mockData = [
        { month: '2024-12', count: 20 },
        { month: '2024-11', count: 22 },
        { month: '2024-10', count: 18 }
      ];
      
      mockApiClient.get.mockResolvedValue(mockData);
      
      await client.getEntriesByMonth(3);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/entries-by-month', { params: { months: 3 } });
    });
  });

  describe('getEmotionDistribution', () => {
    it('should get emotion distribution', async () => {
      const mockDistribution = {
        positive: 60,
        negative: 25,
        neutral: 15
      };
      
      mockApiClient.get.mockResolvedValue(mockDistribution);
      
      const result = await client.getEmotionDistribution();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/emotion-distribution');
      expect(result.positive).toBe(60);
      expect(result.negative).toBe(25);
      expect(result.neutral).toBe(15);
    });
  });

  describe('getActivityHeatmap', () => {
    it('should get activity heatmap', async () => {
      const mockHeatmap = {
        '2024-01-01': 3,
        '2024-01-02': 5,
        '2024-01-03': 2
      };
      
      mockApiClient.get.mockResolvedValue(mockHeatmap);
      
      const result = await client.getActivityHeatmap();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/activity-heatmap', { params: {} });
      expect(result['2024-01-01']).toBe(3);
    });

    it('should accept year parameter', async () => {
      const mockHeatmap = {
        '2023-12-01': 4,
        '2023-12-15': 3
      };
      
      mockApiClient.get.mockResolvedValue(mockHeatmap);
      
      await client.getActivityHeatmap(2023);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/activity-heatmap', { params: { year: 2023 } });
    });
  });

  describe('getStreaks', () => {
    it('should get streaks', async () => {
      const mockStreaks = {
        currentStreak: 7,
        longestStreak: 30,
        totalDays: 150
      };
      
      mockApiClient.get.mockResolvedValue(mockStreaks);
      
      const result = await client.getStreaks();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/streaks');
      expect(result.currentStreak).toBe(7);
      expect(result.longestStreak).toBe(30);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Network error',
        status: undefined
      });
      
      await expect(client.getStats()).rejects.toMatchObject({
        error: 'Network error'
      });
    });

    it('should handle unauthorized access', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Unauthorized',
        status: 401
      });
      
      await expect(client.getStats()).rejects.toMatchObject({
        status: 401
      });
    });

    it('should handle server errors', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Internal server error',
        status: 500
      });
      
      await expect(client.getEntriesByMonth()).rejects.toMatchObject({
        status: 500
      });
    });
  });
});