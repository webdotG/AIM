// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/EmotionsAPIClient.test.js

import { EmotionsAPIClient } from '../EmotionsAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn()
  }
}));

describe('EmotionsAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new EmotionsAPIClient();
  });

  describe('getAll', () => {
    it('should list all emotions from dictionary', async () => {
      const mockEmotions = [
        { id: 1, name_en: 'Joy', name_ru: 'Радость', category: 'positive' },
        { id: 2, name_en: 'Sadness', name_ru: 'Грусть', category: 'negative' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockEmotions);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions');
      expect(result).toHaveLength(2);
    });

    it('should not require authentication', async () => {
      const mockEmotions = [{ id: 1, name_en: 'Joy', category: 'positive' }];
      mockApiClient.get.mockResolvedValue(mockEmotions);
      
      const result = await client.getAll();
      
      expect(result).toBeDefined();
    });
  });

  describe('getByCategory', () => {
    it('should list positive emotions', async () => {
      const mockEmotions = [
        { id: 1, name_en: 'Joy', category: 'positive' },
        { id: 2, name_en: 'Excitement', category: 'positive' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockEmotions);
      
      const result = await client.getByCategory('positive');
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions/category/positive');
      expect(result).toHaveLength(2);
    });

    it('should list negative emotions', async () => {
      const mockEmotions = [
        { id: 1, name_en: 'Anger', category: 'negative' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockEmotions);
      
      const result = await client.getByCategory('negative');
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions/category/negative');
      expect(result).toHaveLength(1);
    });

    it('should list neutral emotions', async () => {
      const mockEmotions = [
        { id: 1, name_en: 'Surprise', category: 'neutral' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockEmotions);
      
      const result = await client.getByCategory('neutral');
      
      expect(result).toHaveLength(1);
    });
  });

  describe('attachToEntry', () => {
    it('should attach emotions to entry', async () => {
      const emotions = [
        { emotion_id: 1, intensity: 8 }
      ];
      
      mockApiClient.post.mockResolvedValue({ success: true });
      
      await client.attachToEntry('entry-123', emotions);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/emotions/entry/entry-123', { emotions });
    });

    it('should attach multiple emotions to entry', async () => {
      const emotions = [
        { emotion_id: 1, intensity: 8 },
        { emotion_id: 2, intensity: 6 }
      ];
      
      mockApiClient.post.mockResolvedValue({ success: true });
      
      await client.attachToEntry('entry-456', emotions);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/emotions/entry/entry-456', { emotions });
    });

    it('should reject invalid intensity', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Intensity must be between 1 and 10',
        status: 400
      });
      
      await expect(client.attachToEntry('entry-123', [{ emotion_id: 1, intensity: 11 }]))
        .rejects.toMatchObject({ status: 400 });
    });

    it('should reject non-existent emotion', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Emotion not found',
        status: 404
      });
      
      await expect(client.attachToEntry('entry-123', [{ emotion_id: 999, intensity: 5 }]))
        .rejects.toMatchObject({ status: 404 });
    });

    it('should reject invalid entry ID', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Entry not found',
        status: 404
      });
      
      await expect(client.attachToEntry('invalid-id', [{ emotion_id: 1, intensity: 5 }]))
        .rejects.toMatchObject({ status: 404 });
    });
  });

  describe('getEntryEmotions', () => {
    it('should get emotions for entry', async () => {
      const mockEmotions = [
        { emotion_id: 1, name_en: 'Joy', intensity: 8 }
      ];
      
      mockApiClient.get.mockResolvedValue(mockEmotions);
      
      const result = await client.getEntryEmotions('entry-123');
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions/entry/entry-123');
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no emotions', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      const result = await client.getEntryEmotions('entry-123');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('deleteEntryEmotions', () => {
    it('should delete emotions from entry', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.deleteEntryEmotions('entry-123');
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/emotions/entry/entry-123');
      expect(result).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get emotion statistics', async () => {
      const mockStats = {
        totalEmotions: 100,
        averageIntensity: 7.5,
        mostCommon: 'Joy',
        byCategory: {
          positive: 60,
          negative: 30,
          neutral: 10
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions/stats');
      expect(result.totalEmotions).toBe(100);
    });
  });

  describe('getMostFrequent', () => {
    it('should get most frequent emotions', async () => {
      const mockFrequent = [
        { emotion_id: 1, name_en: 'Joy', count: 50 },
        { emotion_id: 2, name_en: 'Excitement', count: 30 }
      ];
      
      mockApiClient.get.mockResolvedValue(mockFrequent);
      
      const result = await client.getMostFrequent();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions/most-frequent', { params: { limit: 10 } });
      expect(result).toHaveLength(2);
    });

    it('should get most frequent emotions with custom limit', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      await client.getMostFrequent(5);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/emotions/most-frequent', { params: { limit: 5 } });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Network error',
        status: undefined
      });
      
      await expect(client.getAll()).rejects.toMatchObject({
        error: 'Network error'
      });
    });

    it('should handle unauthorized access', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Unauthorized',
        status: 401
      });
      
      await expect(client.attachToEntry('entry-123', [])).rejects.toMatchObject({
        status: 401
      });
    });
  });
});