// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/CircumstancesAPIClient.test.js

import { CircumstancesAPIClient } from '../CircumstancesAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../../mappers/CircumstanceMapper', () => ({
  CircumstanceMapper: {
    toDomain: jest.fn(data => ({ ...data, isMapped: true })),
    toDomainArray: jest.fn(arr => arr.map(item => ({ ...item, isMapped: true }))),
    toDTO: jest.fn(data => ({ ...data, isDTO: true }))
  }
}));

describe('CircumstancesAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new CircumstancesAPIClient();
  });

  describe('getAll', () => {
    it('should get all circumstances', async () => {
      const mockResponse = {
        data: {
          circumstances: [
            { id: 1, weather: 'sunny', temperature: 25 },
            { id: 2, weather: 'rainy', temperature: 18 }
          ],
          pagination: { total: 2, page: 1, limit: 10 }
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances', { params: {} });
      expect(result.circumstances).toHaveLength(2);
      expect(result.circumstances[0].isMapped).toBe(true);
      expect(result.pagination.total).toBe(2);
    });

    it('should get circumstances with filters', async () => {
      const mockResponse = {
        data: {
          circumstances: [{ id: 1, weather: 'sunny' }],
          pagination: { total: 1, page: 1, limit: 10 }
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const filters = { weather: 'sunny', minTemp: 20 };
      await client.getAll(filters);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances', { params: filters });
    });

    it('should return empty array if no circumstances', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          circumstances: [],
          pagination: { total: 0, page: 1, limit: 10 }
        }
      });
      
      const result = await client.getAll();
      
      expect(result.circumstances).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should get circumstance by id', async () => {
      const mockResponse = {
        data: { id: 1, weather: 'sunny', temperature: 25, moon_phase: 'full' }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getById(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances/1');
      expect(result.isMapped).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should handle non-existent circumstance', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Circumstance not found',
        status: 404
      });
      
      await expect(client.getById(999)).rejects.toMatchObject({
        error: 'Circumstance not found'
      });
    });
  });

  describe('create', () => {
    it('should create a circumstance', async () => {
      const circumstanceData = {
        weather: 'sunny',
        temperature: 25,
        moonPhase: 'full',
        globalEvent: 'Solar eclipse'
      };
      
      const mockResponse = {
        data: { id: 1, weather: 'sunny', temperature: 25 }
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(circumstanceData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/circumstances', {
        ...circumstanceData,
        isDTO: true
      });
      expect(result.isMapped).toBe(true);
    });

    it('should create circumstance with minimal data', async () => {
      const circumstanceData = {
        weather: 'cloudy'
      };
      
      mockApiClient.post.mockResolvedValue({
        data: { id: 1, weather: 'cloudy' }
      });
      
      await client.create(circumstanceData);
      
      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it('should reject invalid temperature', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Temperature must be between -100 and 100',
        status: 400
      });
      
      await expect(client.create({ temperature: 150 })).rejects.toMatchObject({
        status: 400
      });
    });
  });

  describe('update', () => {
    it('should update circumstance', async () => {
      const updateData = { weather: 'rainy', temperature: 18 };
      const mockResponse = {
        data: { id: 1, weather: 'rainy', temperature: 18 }
      };
      
      mockApiClient.put.mockResolvedValue(mockResponse);
      
      const result = await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/circumstances/1', {
        ...updateData,
        isDTO: true
      });
      expect(result.isMapped).toBe(true);
    });

    it('should update partial fields', async () => {
      const updateData = { moonPhase: 'new' };
      mockApiClient.put.mockResolvedValue({
        data: { id: 1, moon_phase: 'new' }
      });
      
      await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/circumstances/1', {
        ...updateData,
        isDTO: true
      });
    });

    it('should not allow updating other user circumstances', async () => {
      mockApiClient.put.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.update(999, { weather: 'sunny' })).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('delete', () => {
    it('should delete circumstance', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete(1);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/circumstances/1');
      expect(result).toBe(true);
    });

    it('should return 404 for non-existent circumstance', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Circumstance not found',
        status: 404
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 404
      });
    });

    it('should not allow deleting other user circumstances', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('getWeatherStats', () => {
    it('should get weather statistics', async () => {
      const mockStats = {
        data: {
          sunny: 45,
          rainy: 30,
          cloudy: 20,
          snowy: 5
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getWeatherStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances/stats/weather', { params: {} });
      expect(result.sunny).toBe(45);
    });

    it('should get weather stats with date range', async () => {
      const mockStats = {
        data: { sunny: 50, rainy: 25, cloudy: 25 }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const params = { startDate: '2024-01-01', endDate: '2024-12-31' };
      await client.getWeatherStats(params);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances/stats/weather', { params });
    });
  });

  describe('getMoonPhaseStats', () => {
    it('should get moon phase statistics', async () => {
      const mockStats = {
        data: {
          full: 12,
          new: 12,
          first_quarter: 12,
          last_quarter: 12
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getMoonPhaseStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances/stats/moon-phase', { params: {} });
      expect(result.full).toBe(12);
    });

    it('should get moon phase stats with filters', async () => {
      const mockStats = {
        data: { full: 10, new: 10 }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const params = { year: 2024 };
      await client.getMoonPhaseStats(params);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances/stats/moon-phase', { params });
    });
  });

  describe('getLatest', () => {
    it('should get latest circumstance', async () => {
      const mockResponse = {
        data: {
          id: 5,
          weather: 'sunny',
          temperature: 24,
          timestamp: new Date()
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getLatest();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/circumstances/latest');
      expect(result.isMapped).toBe(true);
    });

    it('should handle case when no circumstances exist', async () => {
      mockApiClient.get.mockResolvedValue({ data: null });
      
      const result = await client.getLatest();
      
      expect(result.isMapped).toBe(true);
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
      mockApiClient.get.mockRejectedValue({
        error: 'Unauthorized',
        status: 401
      });
      
      await expect(client.getById(1)).rejects.toMatchObject({
        status: 401
      });
    });

    it('should handle validation errors', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Validation failed',
        status: 400,
        data: { fields: ['temperature'] }
      });
      
      await expect(client.create({})).rejects.toMatchObject({
        status: 400
      });
    });
  });
});