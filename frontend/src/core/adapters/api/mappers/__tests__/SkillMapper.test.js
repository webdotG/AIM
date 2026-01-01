// ~/aProject/AIM/frontend/src/core/adapters/api/mappers/__tests__/SkillMapper.test.js

import { SkillMapper } from '../SkillMapper';

describe('SkillMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain object', () => {
      const dto = {
        id: 1,
        user_id: 100,
        name: 'JavaScript',
        description: 'Programming language',
        category: 'programming',
        target_level: 10,
        current_level: 5,
        progress: [{ date: '2024-01-01', xp: 50 }],
        is_active: true,
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-02T12:00:00Z'
      };

      const result = SkillMapper.toDomain(dto);

      expect(result).toEqual({
        id: 1,
        userId: 100,
        name: 'JavaScript',
        description: 'Programming language',
        category: 'programming',
        targetLevel: 10,
        currentLevel: 5,
        progress: [{ date: '2024-01-01', xp: 50 }],
        isActive: true,
        createdAt: new Date('2024-01-01T12:00:00Z'),
        updatedAt: new Date('2024-01-02T12:00:00Z')
      });
    });

    it('should return null for null input', () => {
      expect(SkillMapper.toDomain(null)).toBeNull();
    });

    it('should handle missing progress', () => {
      const dto = {
        id: 1,
        user_id: 100,
        name: 'Python',
        current_level: 3,
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };

      const result = SkillMapper.toDomain(dto);

      expect(result.progress).toEqual([]);
    });
  });

  describe('toDTO', () => {
    it('should map domain object to DTO', () => {
      const skill = {
        name: 'TypeScript',
        description: 'Typed JavaScript',
        category: 'programming',
        targetLevel: 8,
        currentLevel: 4,
        isActive: true
      };

      const result = SkillMapper.toDTO(skill);

      expect(result).toEqual({
        name: 'TypeScript',
        description: 'Typed JavaScript',
        category: 'programming',
        target_level: 8,
        current_level: 4,
        is_active: true
      });
    });

    it('should handle missing optional fields', () => {
      const skill = {
        name: 'React',
        currentLevel: 5
      };

      const result = SkillMapper.toDTO(skill);

      expect(result.name).toBe('React');
      expect(result.current_level).toBe(5);
      expect(result.description).toBeUndefined();
    });
  });

  describe('toDomainArray', () => {
    it('should map array of DTOs to domain objects', () => {
      const dtos = [
        {
          id: 1,
          user_id: 100,
          name: 'Skill 1',
          current_level: 5,
          created_at: '2024-01-01T12:00:00Z',
          updated_at: '2024-01-01T12:00:00Z'
        },
        {
          id: 2,
          user_id: 100,
          name: 'Skill 2',
          current_level: 7,
          created_at: '2024-01-02T12:00:00Z',
          updated_at: '2024-01-02T12:00:00Z'
        }
      ];

      const result = SkillMapper.toDomainArray(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Skill 1');
      expect(result[1].name).toBe('Skill 2');
    });

    it('should handle empty array', () => {
      expect(SkillMapper.toDomainArray([])).toEqual([]);
    });
  });
});