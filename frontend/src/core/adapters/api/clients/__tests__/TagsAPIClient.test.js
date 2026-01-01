// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/TagsAPIClient.test.js

import { TagsAPIClient } from '../TagsAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('TagsAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new TagsAPIClient();
  });

  describe('getAll', () => {
    it('should get all tags', async () => {
      const mockTags = [
        { id: 1, name: 'important', created_at: '2024-01-01' },
        { id: 2, name: 'work', created_at: '2024-01-02' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockTags);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/tags');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('important');
    });

    it('should return empty array if no tags', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      const result = await client.getAll();
      
      expect(result).toHaveLength(0);
    });

    it('should not show tags from other users', async () => {
      const mockTags = [{ id: 1, name: 'mytag' }];
      mockApiClient.get.mockResolvedValue(mockTags);
      
      const result = await client.getAll();
      
      expect(result).toHaveLength(1);
    });
  });

  describe('getById', () => {
    it('should get tag by id', async () => {
      const mockTag = { id: 1, name: 'important', created_at: '2024-01-01' };
      
      mockApiClient.get.mockResolvedValue(mockTag);
      
      const result = await client.getById(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/tags/1');
      expect(result.id).toBe(1);
      expect(result.name).toBe('important');
    });

    it('should return 404 for non-existent tag', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Tag not found',
        status: 404
      });
      
      await expect(client.getById(999)).rejects.toMatchObject({
        status: 404
      });
    });

    it('should not allow access to other user tags', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.getById(999)).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('create', () => {
    it('should create a tag', async () => {
      const tagData = { name: 'newtag' };
      const mockResponse = { id: 1, name: 'newtag', created_at: '2024-01-01' };
      
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(tagData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/tags', tagData);
      expect(result.id).toBe(1);
      expect(result.name).toBe('newtag');
    });

    it('should reject tag without name', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Name is required',
        status: 400
      });
      
      await expect(client.create({})).rejects.toMatchObject({
        status: 400
      });
    });

    it('should reject empty tag name', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Name cannot be empty',
        status: 400
      });
      
      await expect(client.create({ name: '' })).rejects.toMatchObject({
        status: 400
      });
    });

    it('should reject duplicate tag names for same user', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Tag already exists',
        status: 409
      });
      
      await expect(client.create({ name: 'existing' })).rejects.toMatchObject({
        status: 409
      });
    });

    it('should trim whitespace from tag name', async () => {
      const mockResponse = { id: 1, name: 'trimmed' };
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      await client.create({ name: '  trimmed  ' });
      
      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it('should reject tag name longer than 50 characters', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Tag name too long',
        status: 400
      });
      
      const longName = 'a'.repeat(51);
      await expect(client.create({ name: longName })).rejects.toMatchObject({
        status: 400
      });
    });
  });

  describe('update', () => {
    it('should update tag name', async () => {
      const updateData = { name: 'updated' };
      const mockResponse = { id: 1, name: 'updated' };
      
      mockApiClient.put.mockResolvedValue(mockResponse);
      
      const result = await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/tags/1', updateData);
      expect(result.name).toBe('updated');
    });

    it('should not allow updating other user tags', async () => {
      mockApiClient.put.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.update(999, { name: 'test' })).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('delete', () => {
    it('should delete tag', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete(1);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/tags/1');
      expect(result).toBe(true);
    });

    it('should not allow deleting other user tags', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 403
      });
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
  });
});