// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/BodyStatesAPIClient.test.js

import { BodyStatesAPIClient } from '../BodyStatesAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../../mappers/BodyStateMapper', () => ({
  BodyStateMapper: {
    toDomain: jest.fn(data => ({ ...data, isMapped: true })),
    toDomainArray: jest.fn(arr => arr.map(item => ({ ...item, isMapped: true }))),
    toDTO: jest.fn(data => ({ ...data, isDTO: true }))
  }
}));

describe('BodyStatesAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new BodyStatesAPIClient();
  });

  describe('getAll', () => {
    it('should get all body states', async () => {
      const mockResponse = {
        data: {
          bodyStates: [
            { id: 1, health_points: 80, energy_points: 70 },
            { id: 2, health_points: 90, energy_points: 85 }
          ],
          pagination: { total: 2, page: 1, limit: 10 }
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states', { params: {} });
      expect(result.bodyStates).toHaveLength(2);
      expect(result.bodyStates[0].isMapped).toBe(true);
      expect(result.pagination.total).toBe(2);
    });

    it('should get body states with filters', async () => {
      const mockResponse = {
        data: {
          bodyStates: [{ id: 1, health_points: 80 }],
          pagination: { total: 1, page: 1, limit: 10 }
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const filters = { minHealth: 70, maxHealth: 90 };
      await client.getAll(filters);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states', { params: filters });
    });

    it('should return empty array if no body states', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          bodyStates: [],
          pagination: { total: 0, page: 1, limit: 10 }
        }
      });
      
      const result = await client.getAll();
      
      expect(result.bodyStates).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should get body state by id', async () => {
      const mockResponse = {
        data: { id: 1, health_points: 80, energy_points: 70 }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getById(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states/1');
      expect(result.isMapped).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should handle non-existent body state', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Body state not found',
        status: 404
      });
      
      await expect(client.getById(999)).rejects.toMatchObject({
        error: 'Body state not found'
      });
    });
  });

  describe('create', () => {
    it('should create a body state', async () => {
      const bodyStateData = {
        healthPoints: 80,
        energyPoints: 70,
        locationName: 'Home'
      };
      
      const mockResponse = {
        data: { id: 1, health_points: 80, energy_points: 70 }
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(bodyStateData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/body-states', {
        ...bodyStateData,
        isDTO: true
      });
      expect(result.isMapped).toBe(true);
    });

    it('should validate health points range', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Health points must be between 0 and 100',
        status: 400
      });
      
      await expect(client.create({ healthPoints: 150 })).rejects.toMatchObject({
        status: 400
      });
    });

    it('should validate energy points range', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Energy points must be between 0 and 100',
        status: 400
      });
      
      await expect(client.create({ energyPoints: -10 })).rejects.toMatchObject({
        status: 400
      });
    });
  });

  describe('update', () => {
    it('should update body state', async () => {
      const updateData = { healthPoints: 90, energyPoints: 85 };
      const mockResponse = {
        data: { id: 1, health_points: 90, energy_points: 85 }
      };
      
      mockApiClient.put.mockResolvedValue(mockResponse);
      
      const result = await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/body-states/1', {
        ...updateData,
        isDTO: true
      });
      expect(result.isMapped).toBe(true);
    });

    it('should update partial fields', async () => {
      const updateData = { healthPoints: 95 };
      mockApiClient.put.mockResolvedValue({
        data: { id: 1, health_points: 95 }
      });
      
      await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/body-states/1', {
        ...updateData,
        isDTO: true
      });
    });

    it('should not allow updating other user body states', async () => {
      mockApiClient.put.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.update(999, { healthPoints: 80 })).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('delete', () => {
    it('should delete body state', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete(1);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/body-states/1');
      expect(result).toBe(true);
    });

    it('should return 404 for non-existent body state', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Body state not found',
        status: 404
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 404
      });
    });

    it('should not allow deleting other user body states', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('getLatest', () => {
    it('should get latest body state', async () => {
      const mockResponse = {
        data: { id: 5, health_points: 85, energy_points: 80, timestamp: new Date() }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getLatest();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states/latest');
      expect(result.isMapped).toBe(true);
    });

    it('should handle case when no body states exist', async () => {
      mockApiClient.get.mockResolvedValue({ data: null });
      
      const result = await client.getLatest();
      
      expect(result.isMapped).toBe(true);
    });
  });

  describe('getHealthStats', () => {
    it('should get health statistics', async () => {
      const mockStats = {
        data: {
          average: 82,
          min: 60,
          max: 100,
          trend: 'improving'
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getHealthStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states/stats/health', { params: {} });
      expect(result.average).toBe(82);
    });

    it('should get health stats with date range', async () => {
      const mockStats = {
        data: { average: 85, min: 70, max: 95 }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const params = { startDate: '2024-01-01', endDate: '2024-12-31' };
      await client.getHealthStats(params);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states/stats/health', { params });
    });
  });

  describe('getEnergyStats', () => {
    it('should get energy statistics', async () => {
      const mockStats = {
        data: {
          average: 75,
          min: 50,
          max: 100,
          trend: 'stable'
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getEnergyStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states/stats/energy', { params: {} });
      expect(result.average).toBe(75);
    });

    it('should get energy stats with filters', async () => {
      const mockStats = {
        data: { average: 80, min: 65, max: 95 }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const params = { period: 'week' };
      await client.getEnergyStats(params);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/body-states/stats/energy', { params });
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

    it('should handle server errors', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Internal server error',
        status: 500
      });
      
      await expect(client.create({ healthPoints: 80 })).rejects.toMatchObject({
        status: 500
      });
    });
  });
});