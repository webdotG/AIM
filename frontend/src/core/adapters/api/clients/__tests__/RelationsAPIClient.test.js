// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/RelationsAPIClient.test.js

import { RelationsAPIClient } from '../RelationsAPIClient';

jest.mock('../../../config', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn()
  }
}));

describe('RelationsAPIClient', () => {
  let client;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    client = new RelationsAPIClient();
  });

  describe('getTypes', () => {
    it('should get relation types', async () => {
      const mockTypes = [
        { type: 'inspired_by', description: 'This entry was inspired by another' },
        { type: 'related_to', description: 'General relation between entries' },
        { type: 'continuation_of', description: 'This entry continues another' }
      ];
      
      mockApiClient.get.mockResolvedValue(mockTypes);
      
      const result = await client.getTypes();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/relations/types');
      expect(result).toHaveLength(3);
    });
  });

  describe('create', () => {
    it('should create relation between entries', async () => {
      const relationData = {
        from_entry_id: 'entry-1',
        to_entry_id: 'entry-2',
        relation_type: 'inspired_by',
        description: 'Dream inspired this thought'
      };
      
      const mockResponse = { id: 1, ...relationData };
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await client.create(relationData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/relations', relationData);
      expect(result.id).toBe(1);
    });

    it('should reject self-relation', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Cannot create relation to the same entry',
        status: 400
      });
      
      await expect(client.create({
        from_entry_id: 'entry-1',
        to_entry_id: 'entry-1',
        relation_type: 'related_to'
      })).rejects.toMatchObject({ status: 400 });
    });

    it('should reject invalid relation type', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Invalid relation type',
        status: 400
      });
      
      await expect(client.create({
        from_entry_id: 'entry-1',
        to_entry_id: 'entry-2',
        relation_type: 'invalid_type'
      })).rejects.toMatchObject({ status: 400 });
    });

    it('should reject non-existent entries', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Entry not found',
        status: 404
      });
      
      await expect(client.create({
        from_entry_id: 'nonexistent',
        to_entry_id: 'entry-2',
        relation_type: 'related_to'
      })).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('getEntryRelations', () => {
    it('should get relations for entry', async () => {
      const mockRelations = [
        {
          id: 1,
          from_entry_id: 'entry-1',
          to_entry_id: 'entry-2',
          relation_type: 'inspired_by'
        },
        {
          id: 2,
          from_entry_id: 'entry-1',
          to_entry_id: 'entry-3',
          relation_type: 'related_to'
        }
      ];
      
      mockApiClient.get.mockResolvedValue(mockRelations);
      
      const result = await client.getEntryRelations('entry-1');
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/relations/entry/entry-1');
      expect(result).toHaveLength(2);
    });

    it('should return empty array for entry with no relations', async () => {
      mockApiClient.get.mockResolvedValue([]);
      
      const result = await client.getEntryRelations('entry-isolated');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('getMostConnected', () => {
    it('should get most connected entries', async () => {
      const mockConnected = [
        { entry_id: 'entry-1', connection_count: 15 },
        { entry_id: 'entry-2', connection_count: 12 },
        { entry_id: 'entry-3', connection_count: 8 }
      ];
      
      mockApiClient.get.mockResolvedValue(mockConnected);
      
      const result = await client.getMostConnected();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/relations/most-connected', { params: { limit: 10 } });
      expect(result).toHaveLength(3);
    });

    it('should get most connected entries with custom limit', async () => {
      const mockConnected = [
        { entry_id: 'entry-1', connection_count: 20 }
      ];
      
      mockApiClient.get.mockResolvedValue(mockConnected);
      
      await client.getMostConnected(5);
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/relations/most-connected', { params: { limit: 5 } });
    });
  });

  describe('delete', () => {
    it('should delete relation', async () => {
      mockApiClient.delete.mockResolvedValue({});
      
      const result = await client.delete(1);
      
      expect(mockApiClient.delete).toHaveBeenCalledWith('/relations/1');
      expect(result).toBe(true);
    });

    it('should return 404 for non-existent relation', async () => {
      mockApiClient.delete.mockRejectedValue({
        error: 'Relation not found',
        status: 404
      });
      
      await expect(client.delete(999)).rejects.toMatchObject({
        status: 404
      });
    });

    it('should not allow deleting other user relations', async () => {
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
      
      await expect(client.getTypes()).rejects.toMatchObject({
        error: 'Network error'
      });
    });

    it('should handle unauthorized access', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Unauthorized',
        status: 401
      });
      
      await expect(client.create({
        from_entry_id: 'entry-1',
        to_entry_id: 'entry-2',
        relation_type: 'related_to'
      })).rejects.toMatchObject({ status: 401 });
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