// stores/AuthStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import { AuthAPIClient } from '../../core/adapters/api/clients/AuthAPIClient';

export class AuthStore {
  user = null;
  isLoading = false;
  error = null;
  token = localStorage.getItem('token'); // Токен храним тут

  repository = new AuthAPIClient();

  constructor() {
    makeAutoObservable(this);
    if (this.token) this.fetchCurrentUser();
  }

  get isAuthenticated() {
    return !!this.token;
  }

  async fetchCurrentUser() {
    if (!this.token) return;
    
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
        this.logout();
      });
    }
  }

  async login(login, password, hcaptchaToken) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const result = await this.repository.login(login, password, hcaptchaToken);
      
      runInAction(() => {
        this.user = result.user;
        this.token = result.token;
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        this.isLoading = false;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Login failed';
        this.isLoading = false;
        this.token = null;
      });
      throw error;
    }
  }

  async register(login, password, hcaptchaToken) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const result = await this.repository.register(login, password, hcaptchaToken);
      
      runInAction(() => {
        this.user = result.user;
        this.token = result.token;
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        this.isLoading = false;
      });
      
      return result;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Registration failed';
        this.isLoading = false;
        this.token = null;
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
        this.token = null;
        this.error = null;
        this.isLoading = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
    }
  }
}