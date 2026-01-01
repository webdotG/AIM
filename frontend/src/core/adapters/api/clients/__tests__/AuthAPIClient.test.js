// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/AuthAPIClient.test.js

import { AuthAPIClient } from '../AuthAPIClient';

// Mock config с правильным поведением интерцептора
jest.mock('../../../config', () => {
  const mockApiClient = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  };
  return { apiClient: mockApiClient };
});

jest.mock('../../mappers/UserMapper', () => ({
  UserMapper: {
    toDomain: jest.fn(data => ({ ...data, isMapped: true }))
  }
}));

// Mock process.env
const originalEnv = process.env.NODE_ENV;

describe('AuthAPIClient', () => {
  let authClient;
  let mockApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    const config = require('../../../config');
    mockApiClient = config.apiClient;
    
    authClient = new AuthAPIClient();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('prepareCaptchaData', () => {
    it('should return dev token when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
      const result = authClient.prepareCaptchaData('some-token');
      expect(result).toEqual({ hcaptchaToken: 'dev-mode-bypass-token' });
    });

    it('should return actual token when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
      const result = authClient.prepareCaptchaData('real-token');
      expect(result).toEqual({ hcaptchaToken: 'real-token' });
    });
  });

  describe('login', () => {
    it('should call API with correct credentials and store token', async () => {
      // apiClient.post возвращает уже обработанный response.data (из-за интерцептора)
      mockApiClient.post.mockResolvedValue({
        user: { id: 1, login: 'testuser' },
        token: 'jwt-token-123'
      });
      
      const credentials = {
        login: 'testuser',
        password: 'TestPassword123!',
        hcaptchaToken: 'captcha-token'
      };
      
      process.env.NODE_ENV = 'development';
      const result = await authClient.login(credentials);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        login: 'testuser',
        password: 'TestPassword123!',
        hcaptchaToken: 'dev-mode-bypass-token'
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'jwt-token-123');
      expect(localStorage.setItem).toHaveBeenCalledWith('user_id', 1);
      
      expect(result).toEqual({
        user: { id: 1, login: 'testuser', isMapped: true },
        token: 'jwt-token-123'
      });
    });

    it('should handle login error', async () => {
      const errorResponse = {
        error: 'Invalid credentials',
        status: 401,
        data: { message: 'Invalid credentials' }
      };
      
      mockApiClient.post.mockRejectedValue(errorResponse);
      
      await expect(authClient.login({
        login: 'wrong',
        password: 'wrong',
        hcaptchaToken: 'token'
      })).rejects.toEqual(errorResponse);
    });

    it('should handle response with nested data structure', async () => {
      // Если интерцептор не сработал, response.data содержит данные
      mockApiClient.post.mockResolvedValue({
        data: {
          user: { id: 2, login: 'user2' },
          token: 'token-456'
        }
      });
      
      process.env.NODE_ENV = 'production';
      const result = await authClient.login({
        login: 'user2',
        password: 'Pass123!',
        hcaptchaToken: 'real-token'
      });
      
      expect(result.token).toBe('token-456');
    });
  });

  describe('register', () => {
    it('should register user and store token', async () => {
      mockApiClient.post.mockResolvedValue({
        user: { id: 2, login: 'newuser' },
        token: 'jwt-token-456'
      });
      
      process.env.NODE_ENV = 'development';
      const result = await authClient.register({
        login: 'newuser',
        password: 'NewPassword123!',
        hcaptchaToken: 'captcha-token'
      });
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
        login: 'newuser',
        password: 'NewPassword123!',
        hcaptchaToken: 'dev-mode-bypass-token'
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'jwt-token-456');
      expect(localStorage.setItem).toHaveBeenCalledWith('user_id', 2);
      
      expect(result).toEqual({
        user: { id: 2, login: 'newuser', isMapped: true },
        token: 'jwt-token-456'
      });
    });

    it('should handle registration error', async () => {
      mockApiClient.post.mockRejectedValue({
        error: 'Login already exists',
        status: 409
      });
      
      await expect(authClient.register({
        login: 'existing',
        password: 'Pass123!',
        hcaptchaToken: 'token'
      })).rejects.toMatchObject({
        error: 'Login already exists'
      });
    });
  });

  describe('logout', () => {
    it('should remove tokens from localStorage and call API', async () => {
      mockApiClient.post.mockResolvedValue({});
      
      localStorage.setItem('auth_token', 'some-token');
      localStorage.setItem('user_id', '123');
      
      await authClient.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user_id');
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user from API', async () => {
      mockApiClient.get.mockResolvedValue({
        id: 1,
        login: 'currentuser'
      });
      
      const result = await authClient.getCurrentUser();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual({ id: 1, login: 'currentuser', isMapped: true });
    });
  });

  describe('checkPasswordStrength', () => {
    it('should check password strength via API', async () => {
      const mockResponse = {
        isStrong: true,
        score: 85,
        reasons: [],
        suggestions: []
      };
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await authClient.checkPasswordStrength('StrongPass123!');
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/check-password-strength', {
        password: 'StrongPass123!'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle weak password response', async () => {
      const mockResponse = {
        isStrong: false,
        score: 30,
        reasons: ['Too short', 'No special characters'],
        suggestions: ['Use at least 12 characters', 'Add special symbols']
      };
      mockApiClient.post.mockResolvedValue(mockResponse);
      
      const result = await authClient.checkPasswordStrength('weak');
      
      expect(result.isStrong).toBe(false);
      expect(result.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('generatePasswordRecommendation', () => {
    it('should generate password recommendation via API', async () => {
      const mockResponse = {
        password: 'Purple-Monkey-87-Staple!'
      };
      mockApiClient.get.mockResolvedValue(mockResponse);
      
      const result = await authClient.generatePasswordRecommendation();
      
      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/generate-password');
      expect(result).toEqual('Purple-Monkey-87-Staple!');
    });

    it('should generate different passwords on multiple calls', async () => {
      mockApiClient.get
        .mockResolvedValueOnce({ password: 'Password-One-123!' })
        .mockResolvedValueOnce({ password: 'Password-Two-456!' });
      
      const result1 = await authClient.generatePasswordRecommendation();
      const result2 = await authClient.generatePasswordRecommendation();
      
      expect(result1).not.toEqual(result2);
      expect(mockApiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userData = { username: 'newname' };
      mockApiClient.put.mockResolvedValue({ id: 1, username: 'newname' });
      
      const result = await authClient.updateProfile(userData);
      
      expect(mockApiClient.put).toHaveBeenCalledWith('/auth/profile', userData);
      expect(result.isMapped).toBe(true);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockApiClient.post.mockResolvedValue({});
      
      const passwordData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass456!'
      };
      
      const result = await authClient.changePassword(passwordData);
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/change-password', passwordData);
      expect(result).toBe(true);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset', async () => {
      mockApiClient.post.mockResolvedValue({});
      
      const result = await authClient.requestPasswordReset('test@example.com');
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com'
      });
      expect(result).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      mockApiClient.post.mockResolvedValue({});
      
      const result = await authClient.resetPassword('reset-token-123', 'NewPass789!');
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token-123',
        newPassword: 'NewPass789!'
      });
      expect(result).toBe(true);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      mockApiClient.post.mockResolvedValue({});
      
      const result = await authClient.verifyEmail('verify-token-456');
      
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'verify-token-456'
      });
      expect(result).toBe(true);
    });
  });
});