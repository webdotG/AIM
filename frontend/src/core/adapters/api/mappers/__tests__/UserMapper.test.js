// ~/aProject/AIM/frontend/src/core/adapters/api/mappers/__tests__/UserMapper.test.js

import { UserMapper } from '../UserMapper';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map DTO to domain object', () => {
      const dto = {
        id: 1,
        email: 'user@example.com',
        username: 'testuser',
        first_name: 'John',
        last_name: 'Doe',
        avatar: 'avatar.jpg',
        settings: { theme: 'dark' },
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-02T12:00:00Z'
      };

      const result = UserMapper.toDomain(dto);

      expect(result).toEqual({
        id: 1,
        email: 'user@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg',
        settings: { theme: 'dark' },
        createdAt: new Date('2024-01-01T12:00:00Z'),
        updatedAt: new Date('2024-01-02T12:00:00Z')
      });
    });

    it('should return null for null input', () => {
      expect(UserMapper.toDomain(null)).toBeNull();
    });

    it('should handle missing optional fields', () => {
      const dto = {
        id: 1,
        email: 'user@example.com',
        username: 'testuser',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };

      const result = UserMapper.toDomain(dto);

      expect(result.settings).toEqual({});
      expect(result.firstName).toBeUndefined();
    });
  });

  describe('toDTO', () => {
    it('should map domain object to DTO', () => {
      const user = {
        email: 'new@example.com',
        username: 'newuser',
        firstName: 'Jane',
        lastName: 'Smith',
        avatar: 'new-avatar.jpg',
        settings: { language: 'ru' }
      };

      const result = UserMapper.toDTO(user);

      expect(result).toEqual({
        email: 'new@example.com',
        username: 'newuser',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar: 'new-avatar.jpg',
        settings: { language: 'ru' }
      });
    });

    it('should handle missing optional fields', () => {
      const user = {
        email: 'user@example.com',
        username: 'user123'
      };

      const result = UserMapper.toDTO(user);

      expect(result.email).toBe('user@example.com');
      expect(result.username).toBe('user123');
    });
  });
});