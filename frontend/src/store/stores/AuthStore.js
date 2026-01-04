import { makeAutoObservable, runInAction } from 'mobx';
import { AuthAPIClient } from '../../core/adapters/api/clients/AuthAPIClient';
import { UserMapper } from '../../core/adapters/api/mappers/UserMapper';

export class AuthStore {
  user = JSON.parse(localStorage.getItem('user') || 'null');
  isLoading = false;
  error = null;
  token = localStorage.getItem('auth_token');

  repository = new AuthAPIClient();

  constructor() {
    makeAutoObservable(this);
    // При инициализации читаем из localStorage
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
        // Сохраняем в MobX состояние
        this.user = UserMapper.toDomain(data.user);
        this.token = data.token;
        
        // Сохраняем в localStorage
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
    
    return data;
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
          this.error = error.message || 'Password recovery failed';
          this.isLoading = false;
        });
        throw error;
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
      // result = { success: true, data: { isStrong: true, ... } }
      return result.data || result;
    } catch (error) {
      this.error = error.message || 'Password check failed';
      throw error;
    }
  }

async generatePassword() {
  try {
    const result = await this.repository.generatePasswordRecommendation();
    // result = { success: true, data: { password: "..." } }
    return result.data.password;
  } catch (error) {
    this.error = error.message || 'Failed to generate password';
    throw error;
  }
}
}