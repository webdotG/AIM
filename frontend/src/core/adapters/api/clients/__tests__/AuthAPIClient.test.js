// ~/aProject/AIM/frontend/src/core/adapters/api/clients/__tests__/AuthAPIClient.test.js

import { AuthAPIClient } from '../AuthAPIClient';

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
  it('should call API with correct credentials and return data', async () => {
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

    expect(result).toEqual({
      user: { id: 1, login: 'testuser', isMapped: true },
      token: 'jwt-token-123'
    });
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
    // result это весь объект { password: ... }
    expect(result).toEqual(mockResponse); 
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


});