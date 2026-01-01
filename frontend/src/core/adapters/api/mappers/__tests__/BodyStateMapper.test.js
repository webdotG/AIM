// ~/aProject/AIM/frontend/src/core/adapters/api/mappers/__tests__/BodyStateMapper.test.js

import { BodyStateMapper } from '../BodyStateMapper';

describe('BodyStateMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain object', () => {
      const dto = {
        id: 1,
        user_id: 100,
        timestamp: '2024-01-01T12:00:00Z',
        location_point: { type: 'Point', coordinates: [24.1, 56.9] },
        location_name: 'Home',
        location_address: '123 Main St',
        location_precision: 'exact',
        health_points: 80,
        energy_points: 70,
        circumstance_id: 5,
        created_at: '2024-01-01T12:00:00Z'
      };

      const result = BodyStateMapper.toDomain(dto);

      expect(result).toEqual({
        id: 1,
        userId: 100,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        locationPoint: { type: 'Point', coordinates: [24.1, 56.9] },
        locationName: 'Home',
        locationAddress: '123 Main St',
        locationPrecision: 'exact',
        healthPoints: 80,
        energyPoints: 70,
        circumstanceId: 5,
        createdAt: new Date('2024-01-01T12:00:00Z')
      });
    });

    it('should return null for null input', () => {
      expect(BodyStateMapper.toDomain(null)).toBeNull();
    });

    it('should handle missing optional fields', () => {
      const dto = {
        id: 1,
        user_id: 100,
        timestamp: '2024-01-01T12:00:00Z',
        created_at: '2024-01-01T12:00:00Z'
      };

      const result = BodyStateMapper.toDomain(dto);

      expect(result.locationName).toBeUndefined();
      expect(result.healthPoints).toBeUndefined();
    });
  });

  describe('toDTO', () => {
    it('should map domain object to DTO', () => {
      const bodyState = {
        timestamp: new Date('2024-01-01T12:00:00Z'),
        locationPoint: { type: 'Point', coordinates: [24.1, 56.9] },
        locationName: 'Home',
        locationAddress: '123 Main St',
        locationPrecision: 'exact',
        healthPoints: 80,
        energyPoints: 70,
        circumstanceId: 5
      };

      const result = BodyStateMapper.toDTO(bodyState);

      expect(result).toEqual({
        timestamp: '2024-01-01T12:00:00.000Z',
        location_point: { type: 'Point', coordinates: [24.1, 56.9] },
        location_name: 'Home',
        location_address: '123 Main St',
        location_precision: 'exact',
        health_points: 80,
        energy_points: 70,
        circumstance_id: 5
      });
    });

    it('should handle missing timestamp', () => {
      const bodyState = { healthPoints: 80 };
      const result = BodyStateMapper.toDTO(bodyState);
      expect(result.timestamp).toBeUndefined();
    });
  });

  describe('toDomainArray', () => {
    it('should map array of DTOs to domain objects', () => {
      const dtos = [
        { id: 1, user_id: 100, timestamp: '2024-01-01T12:00:00Z', created_at: '2024-01-01T12:00:00Z' },
        { id: 2, user_id: 100, timestamp: '2024-01-02T12:00:00Z', created_at: '2024-01-02T12:00:00Z' }
      ];

      const result = BodyStateMapper.toDomainArray(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });

    it('should handle empty array', () => {
      expect(BodyStateMapper.toDomainArray([])).toEqual([]);
    });
  });
});