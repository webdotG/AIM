import { makeAutoObservable, runInAction } from 'mobx';
import { AuthAPIClient } from '../../core/adapters/api/clients/AuthAPIClient';
import { UserMapper } from '../../core/adapters/api/mappers/UserMapper';
import { apiClient } from '../../core/adapters/config'; 

export class AuthStore {
  user = JSON.parse(localStorage.getItem('user') || 'null');
  isLoading = false;
  error = null;
  token = localStorage.getItem('auth_token');

  repository = new AuthAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  get isAuthenticated() {
    return !!this.token;
  }

  async login({ login, password, hcaptchaToken }) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const data = await this.repository.login({ login, password, hcaptchaToken });
      
      runInAction(() => {
        this.user = UserMapper.toDomain(data.user);
        this.token = data.token;
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        this.isLoading = false;
      });
      
      return data;
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Login failed';
        this.isLoading = false;
        this.token = null;
      });
      throw error;
    }
  }

async register({ login, password, hcaptchaToken }) { 
  this.isLoading = true;
  this.error = null;
  
  try {
    const data = await this.repository.register({ login, password, hcaptchaToken });
    
    runInAction(() => {
      this.user = UserMapper.toDomain(data.user);
      this.token = data.token;
      
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      this.isLoading = false;
    });
    
    return {
      user: data.user,
      token: data.token,
      backupCode: data.backupCode
    };
  } catch (error) {
    runInAction(() => {
      this.error = error.message || 'Registration failed';
      this.isLoading = false;
      this.token = null;
    });
    throw error;
  }
}

  async recover({ backupCode, newPassword, hcaptchaToken }) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const data = await this.repository.recover(backupCode, newPassword, hcaptchaToken);
      // data = { token, backupCode, message }

      runInAction(() => {
        this.token = data.token;
        localStorage.setItem('auth_token', data.token);
        this.isLoading = false;
      });

      // user после установки токена
      await this.fetchCurrentUser();
      
      return {
        message: data.message,
        backupCode: data.backupCode
      };
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Password recovery failed';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async fetchCurrentUser() {
    try {
      const response = await apiClient.get('/auth/verify');
      
      runInAction(() => {
        this.user = UserMapper.toDomain(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      this.logout();
    }
  }

  async logout() {
    runInAction(() => {
      this.user = null;
      this.token = null;
      this.error = null;
      this.isLoading = false;
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    });
    
    window.location.href = '/auth';
  }

async checkPasswordStrength(password) {
  try {
    const result = await this.repository.checkPasswordStrength(password);
    // result = { isStrong, score, reasons, suggestions }
    return result;
  } catch (error) {
    this.error = error.message || 'Password check failed';
    throw error;
  }
}

async generatePassword() {
  try {
    const password = await this.repository.generatePasswordRecommendation();
    // password = "Generated-Pass123" (строка)
    return password;
  } catch (error) {
    this.error = error.message || 'Failed to generate password';
    throw error;
  }
}

}