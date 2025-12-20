import { makeAutoObservable, runInAction } from 'mobx';
import { AuthAPIClient } from '../../core/adapters/api/clients/AuthAPIClient';

export class AuthStore {
  user = null;
  isLoading = false;
  error = null;
  isAuthenticated = false;

  repository = new AuthAPIClient();

  constructor() {
    makeAutoObservable(this);
    this.checkAuth(); // Проверяем авторизацию при создании
  }

  // Используем реализованный метод isAuthenticated из AuthAPIClient
  checkAuth() {
    this.isAuthenticated = this.repository.isAuthenticated();
    if (this.isAuthenticated) {
      this.fetchCurrentUser();
    }
  }

  async fetchCurrentUser() {
    if (!this.isAuthenticated) return;
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const user = await this.repository.getCurrentUser();
      runInAction(() => {
        this.user = user;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to fetch user';
        this.isLoading = false;
        this.logout(); // Если не удалось получить пользователя - выходим
      });
    }
  }

  async login(login, password) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const result = await this.repository.login(login, password);
      
      runInAction(() => {
        this.user = result.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Login failed';
        this.isLoading = false;
        this.isAuthenticated = false;
      });
      throw error;
    }
  }

  async register(login, password) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const result = await this.repository.register(login, password);
      
      runInAction(() => {
        this.user = result.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Registration failed';
        this.isLoading = false;
        this.isAuthenticated = false;
      });
      throw error;
    }
  }

  async recover(login, backupCode, newPassword) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const result = await this.repository.recover(login, backupCode, newPassword);
      
      runInAction(() => {
        this.user = result.user;
        this.isAuthenticated = true;
        this.isLoading = false;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Recovery failed';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async logout() {
    this.isLoading = true;
    
    try {
      await this.repository.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      runInAction(() => {
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;
        this.isLoading = false;
      });
    }
  }

  clearError() {
    this.error = null;
  }
}