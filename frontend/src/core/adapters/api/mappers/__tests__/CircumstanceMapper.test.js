// ~/aProject/AIM/frontend/src/core/adapters/api/mappers/__tests__/CircumstanceMapper.test.js

import { CircumstanceMapper } from '../CircumstanceMapper';

describe('CircumstanceMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain object', () => {
      const dto = {
        id: 1,
        user_id: 100,
        timestamp: '2024-01-01T12:00:00Z',
        weather: 'sunny',
        temperature: 25,
        moon_phase: 'full',
        global_event: 'Solar eclipse',
        notes: 'Beautiful day',
        created_at: '2024-01-01T12:00:00Z'
      };

      const result = CircumstanceMapper.toDomain(dto);

      expect(result).toEqual({
        id: 1,
        userId: 100,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        weather: 'sunny',
        temperature: 25,
        moonPhase: 'full',
        globalEvent: 'Solar eclipse',
        notes: 'Beautiful day',
        createdAt: new Date('2024-01-01T12:00:00Z')
      });
    });

    it('should return null for null input', () => {
      expect(CircumstanceMapper.toDomain(null)).toBeNull();
    });

    it('should handle missing optional fields', () => {
      const dto = {
        id: 1,
        user_id: 100,
        timestamp: '2024-01-01T12:00:00Z',
        created_at: '2024-01-01T12:00:00Z'
      };

      const result = CircumstanceMapper.toDomain(dto);

      expect(result.weather).toBeUndefined();
      expect(result.temperature).toBeUndefined();
    });
  });

  describe('toDTO', () => {
    it('should map domain object to DTO', () => {
      const circumstance = {
        timestamp: new Date('2024-01-01T12:00:00Z'),
        weather: 'rainy',
        temperature: 18,
        moonPhase: 'new',
        globalEvent: 'Election day',
        notes: 'Rainy weather'
      };

      const result = CircumstanceMapper.toDTO(circumstance);

      expect(result).toEqual({
        timestamp: '2024-01-01T12:00:00.000Z',
        weather: 'rainy',
        temperature: 18,
        moon_phase: 'new',
        global_event: 'Election day',
        notes: 'Rainy weather'
      });
    });

    it('should handle missing timestamp', () => {
      const circumstance = { weather: 'sunny' };
      const result = CircumstanceMapper.toDTO(circumstance);
      expect(result.timestamp).toBeUndefined();
    });
  });

  describe('toDomainArray', () => {
    it('should map array of DTOs to domain objects', () => {
      const dtos = [
        { id: 1, user_id: 100, timestamp: '2024-01-01T12:00:00Z', weather: 'sunny', created_at: '2024-01-01T12:00:00Z' },
        { id: 2, user_id: 100, timestamp: '2024-01-02T12:00:00Z', weather: 'rainy', created_at: '2024-01-02T12:00:00Z' }
      ];

      const result = CircumstanceMapper.toDomainArray(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].weather).toBe('sunny');
      expect(result[1].weather).toBe('rainy');
    });

    it('should handle empty array', () => {
      expect(CircumstanceMapper.toDomainArray([])).toEqual([]);
    });
  });
});