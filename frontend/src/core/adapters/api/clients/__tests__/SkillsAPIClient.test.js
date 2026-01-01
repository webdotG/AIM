// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/SkillsAPIClient.test.js

import { SkillsAPIClient } from '../SkillsAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../../mappers/SkillMapper', () => ({
  SkillMapper: {
    toDomain: jest.fn(data => ({ ...data, isMapped: true })),
    toDomainArray: jest.fn(arr => arr.map(item => ({ ...item, isMapped: true }))),
    toDTO: jest.fn(data => ({ ...data, isDTO: true }))
  }
}));

describe('SkillsAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new SkillsAPIClient();
  });

  describe('getAll', () => {
    it('should get all skills', async () => {
      const mockResponse = {
        data: {
          skills: [
            { id: 1, name: 'JavaScript', current_level: 5, experience_points: 500 },
            { id: 2, name: 'Python', current_level: 3, experience_points: 300 }
          ],
          pagination: { total: 2, page: 1, limit: 10 }
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills', { params: {} });
      expect(result.skills).toHaveLength(2);
      expect(result.skills[0].isMapped).toBe(true);
      expect(result.pagination.total).toBe(2);
    });

    it('should get skills with filters', async () => {
      const mockResponse = {
        data: {
          skills: [{ id: 1, name: 'JavaScript', category: 'programming' }],
          pagination: { total: 1, page: 1, limit: 10 }
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const filters = { category: 'programming', minLevel: 3 };
      await client.getAll(filters);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills', { params: filters });
    });

    it('should return empty array if no skills', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          skills: [],
          pagination: { total: 0, page: 1, limit: 10 }
        }
      });
      
      const result = await client.getAll();
      
      expect(result.skills).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should get skill by id', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'JavaScript',
          current_level: 5,
          experience_points: 500,
          category: 'programming'
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getById(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills/1');
      expect(result.isMapped).toBe(true);
      expect(result.id).toBe(1);
    });

    it('should handle non-existent skill', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Skill not found',
        status: 404
      });
      
      await expect(client.getById(999)).rejects.toMatchObject({
        error: 'Skill not found'
      });
    });
  });

  describe('create', () => {
    it('should create a skill', async () => {
      const skillData = {
        name: 'TypeScript',
        category: 'programming',
        description: 'Typed JavaScript',
        currentLevel: 1,
        experiencePoints: 0
      };
      
      const mockResponse = {
        data: { id: 1, name: 'TypeScript', current_level: 1 }
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(skillData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/skills', {
        ...skillData,
        isDTO: true
      });
      expect(result.isMapped).toBe(true);
    });

    it('should reject duplicate skill names', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Skill with this name already exists',
        status: 409
      });
      
      await expect(client.create({ name: 'JavaScript' })).rejects.toMatchObject({
        status: 409
      });
    });

    it('should validate skill name', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Skill name is required',
        status: 400
      });
      
      await expect(client.create({ name: '' })).rejects.toMatchObject({
        status: 400
      });
    });
  });

  describe('update', () => {
    it('should update skill', async () => {
      const updateData = {
        name: 'JavaScript (Updated)',
        currentLevel: 6,
        experiencePoints: 600
      };
      
      const mockResponse = {
        data: { id: 1, name: 'JavaScript (Updated)', current_level: 6 }
      };
      
      mockApiClient.put.mockResolvedValue(mockResponse);
      
      const result = await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/skills/1', {
        ...updateData,
        isDTO: true
      });
      expect(result.isMapped).toBe(true);
    });

    it('should not allow updating other user skills', async () => {
      mockApiClient.put.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.update(999, { name: 'Test' })).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('delete', () => {
    it('should delete skill', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete(1);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/skills/1');
      expect(result).toBe(true);
    });

    it('should not allow deleting other user skills', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('addProgress', () => {
    it('should add progress to skill', async () => {
      const progressData = {
        progress_type: 'practice',
        experience_gained: 50,
        notes: 'Completed tutorial'
      };
      
      const mockResponse = {
        data: {
          id: 1,
          name: 'JavaScript',
          current_level: 5,
          experience_points: 550
        }
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.addProgress(1, progressData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/skills/1/progress', progressData);
      expect(result.isMapped).toBe(true);
      expect(result.experience_points).toBe(550);
    });

    it('should add progress with entry reference', async () => {
      const progressData = {
        entry_id: 'entry-123',
        experience_gained: 30
      };
      
      mockApiClient.post.mockResolvedValue({
        data: { id: 1, experience_points: 530 }
      });
      
      await client.addProgress(1, progressData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/skills/1/progress', progressData);
    });

    it('should validate experience gained', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Experience gained must be positive',
        status: 400
      });
      
      await expect(client.addProgress(1, { experience_gained: -10 }))
        .rejects.toMatchObject({ status: 400 });
    });
  });

  describe('getProgressHistory', () => {
    it('should get progress history for skill', async () => {
      const mockHistory = {
        data: [
          { id: 1, experience_gained: 50, created_at: '2024-01-01' },
          { id: 2, experience_gained: 30, created_at: '2024-01-02' }
        ]
      };
      
      mockApiClient.get.mockResolvedValue(mockHistory);
      
      const result = await client.getProgressHistory(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills/1/progress', { params: {} });
      expect(result).toHaveLength(2);
    });

    it('should get progress history with date range', async () => {
      const mockHistory = {
        data: [{ id: 1, experience_gained: 50 }]
      };
      
      mockApiClient.get.mockResolvedValue(mockHistory);
      
      const params = { startDate: '2024-01-01', endDate: '2024-12-31' };
      await client.getProgressHistory(1, params);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills/1/progress', { params });
    });
  });

  describe('getStats', () => {
    it('should get skill statistics', async () => {
      const mockStats = {
        data: {
          totalSkills: 10,
          averageLevel: 4.5,
          totalExperience: 5000,
          topSkills: [
            { name: 'JavaScript', level: 8 },
            { name: 'Python', level: 6 }
          ]
        }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const result = await client.getStats();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills/stats', { params: {} });
      expect(result.totalSkills).toBe(10);
      expect(result.topSkills).toHaveLength(2);
    });

    it('should get stats with filters', async () => {
      const mockStats = {
        data: { totalSkills: 5, averageLevel: 5.0 }
      };
      
      mockApiClient.get.mockResolvedValue(mockStats);
      
      const params = { category: 'programming' };
      await client.getStats(params);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/skills/stats', { params });
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
        data: { message: 'Name is required' }
      });
      
      await expect(client.create({})).rejects.toMatchObject({
        status: 400
      });
    });
  });
});