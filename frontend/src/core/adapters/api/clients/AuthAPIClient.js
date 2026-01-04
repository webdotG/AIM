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

async register(userData) {
  const captchaData = this.prepareCaptchaData(userData.hcaptchaToken);
  const response = await apiClient.post('/auth/register', {
    login: userData.login,
    password: userData.password,
    ...captchaData,
  });
  
  return {
    user: UserMapper.toDomain(response.data.user),
    token: response.data.token,
    backupCode: response.data.backupCode
  };
}

  async recover(backupCode, newPassword, hcaptchaToken) {
    const captchaData = this.prepareCaptchaData(hcaptchaToken);
    const data = await apiClient.post('/auth/recover', {
      backup_code: backupCode,  
      new_password: newPassword,
      ...captchaData,
    });
    
    return {
      token: data.token,
      backupCode: data.backup_code,
      message: data.message
    };
  }

async checkPasswordStrength(password) {
  const response = await apiClient.post('/auth/check-password-strength', { password });
  // response = { success: true, data: { isStrong, score, reasons, suggestions } }
  return response.data;
}

async generatePasswordRecommendation() {
  const data = await apiClient.get('/auth/generate-password');
  // data = { success: true, data: { password: "..." } }
  // После интерцептора: data уже распакован
  
  if (data && data.data && data.data.password) {
    return data.data.password; // строку
  }
  
  throw new Error('Invalid password response structure');
}

}