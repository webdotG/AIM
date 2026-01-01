// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/EntriesAPIClient.test.js

import { EntriesAPIClient } from '../EntriesAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../../mappers/EntryMapper', () => ({
  EntryMapper: {
    toDomain: jest.fn(data => ({ ...data, isMapped: true })),
    toDomainArray: jest.fn(arr => arr.map(item => ({ ...item, isMapped: true })))
  }
}));

describe('EntriesAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new EntriesAPIClient();
  });

  describe('getAll', () => {
    it('should get all entries', async () => {
      const mockResponse = {
        entries: [
          { id: '1', entry_type: 'dream', content: 'Dream content' },
          { id: '2', entry_type: 'thought', content: 'Thought content' }
        ],
        pagination: { total: 2, page: 1, limit: 10 }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await client.getAll();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/entries', { params: {} });
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].isMapped).toBe(true);
      expect(result.pagination.total).toBe(2);
    });

    it('should get entries with filters', async () => {
      const mockResponse = {
        entries: [{ id: '1', entry_type: 'dream' }],
        pagination: { total: 1, page: 1, limit: 10 }
      };
      
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const filters = { type: 'dream', limit: 20 };
      await client.getAll(filters);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/entries', { params: filters });
    });

    it('should handle empty response', async () => {
      mockApiClient.get.mockResolvedValue({});
      
      const result = await client.getAll();
      
      expect(result.entries).toHaveLength(0);
      expect(result.pagination).toEqual({});
    });
  });

  describe('getById', () => {
    it('should get entry by id', async () => {
      const mockEntry = {
        id: '123',
        entry_type: 'dream',
        content: 'Dream content',
        emotions: [],
        tags: []
      };
      
      mockApiClient.get.mockResolvedValue(mockEntry);
      
      const result = await client.getById('123');
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/entries/123');
      expect(result.isMapped).toBe(true);
      expect(result.id).toBe('123');
    });

    it('should handle non-existent entry', async () => {
      mockApiClient.get.mockRejectedValue({
        error: 'Entry not found',
        status: 404
      });
      
      await expect(client.getById('999')).rejects.toMatchObject({
        error: 'Entry not found'
      });
    });
  });

  describe('create', () => {
    it('should create a dream entry', async () => {
      const entryData = {
        type: 'dream',
        content: 'I dreamed about flying',
        emotions: [1, 2],
        tags: ['lucid', 'flying']
      };
      
      const mockResponse = {
        id: '1',
        entry_type: 'dream',
        content: 'I dreamed about flying'
      };
      
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(entryData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/entries', {
        entry_type: 'dream',
        content: 'I dreamed about flying',
        emotions: [1, 2],
        people: [],
        tags: ['lucid', 'flying'],
        is_completed: false,
        deadline: null
      });
      expect(result.isMapped).toBe(true);
    });

    it('should create a memory entry', async () => {
      const entryData = {
        type: 'memory',
        content: 'Childhood memory'
      };
      
      mockApiClient.post.mockResolvedValue({
        id: '2',
        entry_type: 'memory',
        content: 'Childhood memory'
      });
      
      await client.create(entryData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/entries', expect.objectContaining({
        entry_type: 'memory',
        content: 'Childhood memory'
      }));
    });

    it('should create a thought entry', async () => {
      const entryData = {
        type: 'thought',
        content: 'Random thought'
      };
      
      mockApiClient.post.mockResolvedValue({
        id: '3',
        entry_type: 'thought',
        content: 'Random thought'
      });
      
      await client.create(entryData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/entries', expect.objectContaining({
        entry_type: 'thought'
      }));
    });

    it('should create a plan entry with deadline', async () => {
      const deadline = new Date('2025-12-31');
      const entryData = {
        type: 'plan',
        content: 'Finish project',
        deadline: deadline,
        isCompleted: false
      };
      
      mockApiClient.post.mockResolvedValue({
        id: '4',
        entry_type: 'plan',
        content: 'Finish project',
        deadline: deadline.toISOString()
      });
      
      await client.create(entryData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/entries', expect.objectContaining({
        entry_type: 'plan',
        deadline: deadline.toISOString(),
        is_completed: false
      }));
    });

    it('should reject entry without content', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Content is required',
        status: 400
      });
      
      await expect(client.create({ type: 'dream', content: '' })).rejects.toMatchObject({
        status: 400
      });
    });

    it('should reject entry with invalid type', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Invalid entry type',
        status: 400
      });
      
      await expect(client.create({ type: 'invalid', content: 'test' })).rejects.toMatchObject({
        status: 400
      });
    });
  });

  describe('update', () => {
    it('should update entry content', async () => {
      const updateData = {
        type: 'dream',
        content: 'Updated dream content'
      };
      
      mockApiClient.put.mockResolvedValue({
        id: '1',
        entry_type: 'dream',
        content: 'Updated dream content'
      });
      
      const result = await client.update('1', updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/entries/1', {
        entry_type: 'dream',
        content: 'Updated dream content',
        emotions: [],
        people: [],
        tags: [],
        is_completed: false,
        deadline: null
      });
      expect(result.isMapped).toBe(true);
    });

    it('should mark plan as completed', async () => {
      const updateData = {
        type: 'plan',
        content: 'Completed task',
        isCompleted: true
      };
      
      mockApiClient.put.mockResolvedValue({
        id: '1',
        entry_type: 'plan',
        is_completed: true
      });
      
      await client.update('1', updateData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/entries/1', expect.objectContaining({
        is_completed: true
      }));
    });

    it('should not allow updating other user entries', async () => {
      mockApiClient.put.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.update('999', { type: 'dream', content: 'test' }))
        .rejects.toMatchObject({ status: 403 });
    });
  });

  describe('delete', () => {
    it('should delete entry', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete('1');
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/entries/1');
      expect(result).toBe(true);
    });

    it('should not allow deleting other user entries', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Forbidden',
        status: 403
      });
      
      await expect(client.delete('999')).rejects.toMatchObject({
        status: 403
      });
    });
  });

  describe('search', () => {
    it('should search entries by query', async () => {
      const mockResults = [
        { id: '1', entry_type: 'dream', content: 'flying dream' },
        { id: '2', entry_type: 'thought', content: 'flying thoughts' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockResults);
      
      const result = await client.search('flying');
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/entries/search', {
        params: { query: 'flying', limit: 20 }
      });
      expect(result).toHaveLength(2);
      expect(result[0].isMapped).toBe(true);
    });

    it('should search with custom limit', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      await client.search('test', 50);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/entries/search', {
        params: { query: 'test', limit: 50 }
      });
    });

    it('should handle empty search results', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      const result = await client.search('nonexistent');
      
      expect(result).toHaveLength(0);
    });

    it('should handle null search results', async () => {
      mockApiClient.get.mockResolvedValue(null);
      
      const result = await client.search('test');
      
      expect(result).toHaveLength(0);
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
      
      await expect(client.getById('1')).rejects.toMatchObject({
        status: 401
      });
    });

    it('should handle validation errors', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Validation failed',
        status: 400,
        data: { message: 'Content is required' }
      });
      
      await expect(client.create({ type: 'dream' })).rejects.toMatchObject({
        status: 400
      });
    });
  });
});