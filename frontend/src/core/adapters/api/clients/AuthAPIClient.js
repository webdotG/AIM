import { apiClient } from '../../config';
import { AuthRepository } from '../../../repositories/AuthRepository';
import { UserMapper } from '../mappers/UserMapper';

export class AuthAPIClient extends AuthRepository {

  prepareCaptchaData(captchaToken) {
    if (isDevelopment()) {
      // В режиме разработки используем специальный токен
      return {
        hcaptchaToken: 'dev-mode-bypass-token',
      };
    // return {
    //   hcaptchaToken: captchaToken,
    //   devMode: true,
    // };
    }
    // production требуем реальный токен
    return { hcaptchaToken: captchaToken };
  }

  async login(credentials) {
    const captchaData = this.prepareCaptchaData(credentials.hcaptchaToken);
    const response = await apiClient.post('/auth/login', {
      login: credentials.login,
      password: credentials.password,
      ...captchaData,
    });
    
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_id', response.user.id);
    }
    
    return {
      user: UserMapper.toDomain(response.user),
      token: response.token
    };
  }

  async register(userData) {

    const captchaData = this.prepareCaptchaData(userData.hcaptchaToken);
    
    const response = await apiClient.post('/auth/register', {
      login: userData.login,
      password: userData.password,
      ...captchaData,
    });
    
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_id', response.user.id);
    }
    
    return {
      user: UserMapper.toDomain(response.user),
      token: response.token
    };
  }

  async logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    await apiClient.post('/auth/logout');
  }

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return UserMapper.toDomain(response);
  }

  async updateProfile(userData) {
    const response = await apiClient.put('/auth/profile', userData);
    return UserMapper.toDomain(response);
  }

  async changePassword(passwordData) {
    await apiClient.post('/auth/change-password', passwordData);
    return true;
  }

  async requestPasswordReset(email) {
    await apiClient.post('/auth/forgot-password', { email });
    return true;
  }

  async resetPassword(token, newPassword) {
    await apiClient.post('/auth/reset-password', { token, newPassword });
    return true;
  }

  async verifyEmail(token) {
    await apiClient.post('/auth/verify-email', { token });
    return true;
  }
    async checkPasswordStrength(password) {
    const response = await apiClient.post('/auth/check-password-strength', { password });
    return response.data;
  }

  async generatePasswordRecommendation() {
    const response = await apiClient.get('/auth/generate-password');
    return response.data.password;
  }

}