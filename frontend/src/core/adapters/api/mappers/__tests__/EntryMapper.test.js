// ~/aProject/AIM/frontend/src/core/adapters/api/mappers/__tests__/EntryMapper.test.js

import { EntryMapper } from '../EntryMapper';

describe('EntryMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain object', () => {
      const dto = {
        id: 'entry-123',
        user_id: 100,
        entry_type: 'dream',
        content: 'I dreamed about flying',
        emotions: [1, 2],
        people: [10, 20],
        tags: ['lucid', 'flying'],
        relations: { inspired_by: ['entry-456'] },
        is_completed: false,
        deadline: '2025-12-31',
        circumstance_id: 5,
        body_state_id: 3,
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-02T12:00:00Z'
      };

      const result = EntryMapper.toDomain(dto);

      expect(result).toEqual({
        id: 'entry-123',
        userId: 100,
        type: 'dream',
        content: 'I dreamed about flying',
        emotions: [1, 2],
        people: [10, 20],
        tags: ['lucid', 'flying'],
        relations: { inspired_by: ['entry-456'] },
        isCompleted: false,
        deadline: new Date('2025-12-31'),
        circumstanceId: 5,
        bodyStateId: 3,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        updatedAt: new Date('2024-01-02T12:00:00Z')
      });
    });

    it('should return null for null input', () => {
      expect(EntryMapper.toDomain(null)).toBeNull();
    });

    it('should handle missing optional fields', () => {
      const dto = {
        id: 'entry-123',
        user_id: 100,
        entry_type: 'thought',
        content: 'Random thought',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };

      const result = EntryMapper.toDomain(dto);

      expect(result.emotions).toEqual([]);
      expect(result.people).toEqual([]);
      expect(result.tags).toEqual([]);
      expect(result.deadline).toBeNull();
    });

    it('should handle null deadline', () => {
      const dto = {
        id: 'entry-123',
        user_id: 100,
        entry_type: 'plan',
        content: 'Do something',
        deadline: null,
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };

      const result = EntryMapper.toDomain(dto);
      expect(result.deadline).toBeNull();
    });
  });

  describe('toDTO', () => {
    it('should map domain object to DTO', () => {
      const entry = {
        type: 'memory',
        content: 'Childhood memory',
        emotions: [1, 2, 3],
        people: [5, 6],
        tags: ['childhood', 'happy'],
        isCompleted: false,
        deadline: new Date('2025-12-31'),
        circumstanceId: 10,
        bodyStateId: 20
      };

      const result = EntryMapper.toDTO(entry);

      expect(result).toEqual({
        entry_type: 'memory',
        content: 'Childhood memory',
        emotions: [1, 2, 3],
        people: [5, 6],
        tags: ['childhood', 'happy'],
        is_completed: false,
        deadline: '2025-12-31T00:00:00.000Z',
        circumstance_id: 10,
        body_state_id: 20
      });
    });

    it('should handle missing optional fields', () => {
      const entry = {
        type: 'thought',
        content: 'Just a thought'
      };

      const result = EntryMapper.toDTO(entry);

      expect(result.emotions).toEqual([]);
      expect(result.people).toEqual([]);
      expect(result.tags).toEqual([]);
      expect(result.is_completed).toBe(false);
      expect(result.deadline).toBeNull();
    });
  });

  describe('toDomainArray', () => {
    it('should map array of DTOs to domain objects', () => {
      const dtos = [
        {
          id: 'entry-1',
          user_id: 100,
          entry_type: 'dream',
          content: 'Dream 1',
          created_at: '2024-01-01T12:00:00Z',
          updated_at: '2024-01-01T12:00:00Z'
        },
        {
          id: 'entry-2',
          user_id: 100,
          entry_type: 'thought',
          content: 'Thought 1',
          created_at: '2024-01-02T12:00:00Z',
          updated_at: '2024-01-02T12:00:00Z'
        }
      ];

      const result = EntryMapper.toDomainArray(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('dream');
      expect(result[1].type).toBe('thought');
    });

    it('should handle empty array', () => {
      expect(EntryMapper.toDomainArray([])).toEqual([]);
    });
  });
});