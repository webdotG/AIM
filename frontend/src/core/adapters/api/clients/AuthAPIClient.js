import { apiClient } from '../../config';
import { AuthRepository } from '../../../repositories/AuthRepository';
import { UserMapper } from '../mappers/UserMapper';

const isDevelopment = () => process.env.NODE_ENV === 'development';

export class AuthAPIClient extends AuthRepository {

  prepareCaptchaData(captchaToken) {
    if (isDevelopment()) {
      return { hcaptchaToken: 'dev-mode-bypass-token' };
    }
    return { hcaptchaToken: captchaToken };
  }

  async login(credentials) {
    const captchaData = this.prepareCaptchaData(credentials.hcaptchaToken);
    const data = await apiClient.post('/auth/login', {
      login: credentials.login,
      password: credentials.password,
      ...captchaData,
    });
    
    return {
      user: UserMapper.toDomain(data.user),
      token: data.token
    };
  }

  async logout() {
    return Promise.resolve();
  }

  async register(userData) {
    const captchaData = this.prepareCaptchaData(userData.hcaptchaToken);
    const data = await apiClient.post('/auth/register', {
      login: userData.login,
      password: userData.password,
      ...captchaData,
    });
    
    return {
      user: UserMapper.toDomain(data.user),
      token: data.token
    };
  }

async recover(backupCode, newPassword, hcaptchaToken) {
  const captchaData = this.prepareCaptchaData(hcaptchaToken);
  // data уже response.data!
  const data = await apiClient.post('/auth/recover', {
    backupCode,
    newPassword,
    ...captchaData,
  });
  
  return {
    user: UserMapper.toDomain(data.user),
    token: data.token,
    backupCode: data.backupCode || data.newBackupCode
  };
}

async checkPasswordStrength(password) {
  const data = await apiClient.post('/auth/check-password-strength', { password });
  // data = { isStrong: true, score: 85, reasons: [], suggestions: [] }
  return data;
}

async generatePasswordRecommendation() {
  const data = await apiClient.get('/auth/generate-password');
  // data = { success: true, data: { password: "..." } }
  if (data.data && data.data.password) {
    return { 
      success: true, 
      data: { password: data.data.password } 
    };
  }
  throw new Error('Invalid password response structure');
}
}