// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/PeopleAPIClient.test.js

import { PeopleAPIClient } from '../PeopleAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('PeopleAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new PeopleAPIClient();
  });

  describe('getAll', () => {
    it('should list all people for user', async () => {
      const mockPeople = [
        { id: 1, name: 'John Doe', category: 'friends' },
        { id: 2, name: 'Jane Smith', category: 'family' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockPeople);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/people', { params: {} });
      expect(result).toHaveLength(2);
    });

    it('should filter people by category', async () => {
      const mockPeople = [
        { id: 1, name: 'John', category: 'friends' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockPeople);
      
      const result = await client.getAll({ category: 'friends' });
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/people', { params: { category: 'friends' } });
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no people', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      const result = await client.getAll();
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getById', () => {
    it('should get person by id', async () => {
      const mockPerson = {
        id: 1,
        name: 'John Doe',
        category: 'friends',
        relationship: 'Childhood friend',
        bio: 'Long time friend'
      };
      
      mockApiClient.get.mockResolvedValue(mockPerson);
      
      const result = await client.getById(1);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/people/1');
      expect(result.name).toBe('John Doe');
    });

    it('should return 404 for non-existent person', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Person not found',
        status: 404
      });
      
      await expect(client.getById(999)).rejects.toMatchObject({
        status: 404
      });
    });

    it('should not allow access to other user people', async () => {
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
    it('should create a person', async () => {
      const personData = {
        name: 'New Person',
        category: 'friends',
        relationship: 'Colleague'
      };
      
      const mockResponse = { id: 1, ...personData };
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(personData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/people', personData);
      expect(result.name).toBe('New Person');
    });

    it('should create person with minimal data', async () => {
      const personData = {
        name: 'Minimal Person',
        category: 'acquaintances'
      };
      
      mockApiClient.post.mockResolvedValue({ id: 1, ...personData });
      
      await client.create(personData);
      
      expect(mockApiClient.post).toHaveBeenCalled();
    });

    it('should reject person without name', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Name is required',
        status: 400
      });
      
      await expect(client.create({ category: 'friends' })).rejects.toMatchObject({
        status: 400
      });
    });

    it('should reject person without category', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Category is required',
        status: 400
      });
      
      await expect(client.create({ name: 'John' })).rejects.toMatchObject({
        status: 400
      });
    });

    it('should reject invalid category', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Invalid category',
        status: 400
      });
      
      await expect(client.create({ name: 'John', category: 'invalid' }))
        .rejects.toMatchObject({ status: 400 });
    });
  });

  describe('update', () => {
    it('should update person', async () => {
      const updateData = {
        name: 'Updated Name',
        relationship: 'Best friend'
      };
      
      mockApiClient.put.mockResolvedValue({ id: 1, ...updateData });
      
      const result = await client.update(1, updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/people/1', updateData);
      expect(result.name).toBe('Updated Name');
    });

    it('should not allow updating other user people', async () => {
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
    it('should delete person', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete(1);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/people/1');
      expect(result).toBe(true);
    });

    it('should not allow deleting other user people', async () => {
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

    it('should handle validation errors', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Validation failed',
        status: 400
      });
      
      await expect(client.create({})).rejects.toMatchObject({
        status: 400
      });
    });
  });
});