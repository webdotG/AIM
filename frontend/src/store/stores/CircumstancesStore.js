import { makeAutoObservable, runInAction } from 'mobx';
import { CircumstancesAPIClient } from '../../core/adapters/api/clients/CircumstancesAPIClient';

export class CircumstancesStore {
  circumstances = [];
  isLoading = false;
  error = null;
  weatherStats = null;
  moonPhaseStats = null;

  repository = new CircumstancesAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCircumstances(filters = {}) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await this.repository.getAll(filters);
      
      runInAction(() => {
        this.circumstances = response.circumstances;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to fetch circumstances';
        this.isLoading = false;
      });
    }
  }

  async createCircumstance(data) {
    try {
      const circumstance = await this.repository.create(data);
      
      runInAction(() => {
        this.circumstances.unshift(circumstance);
      });
      
      return circumstance;
    } catch (error) {
      throw error;
    }
  }

  async fetchWeatherStats(params = {}) {
    try {
      const stats = await this.repository.getWeatherStats(params);
      
      runInAction(() => {
        this.weatherStats = stats;
      });
    } catch (error) {
      console.error('Failed to fetch weather stats', error);
    }
  }

  async fetchMoonPhaseStats(params = {}) {
    try {
      const stats = await this.repository.getMoonPhaseStats(params);
      
      runInAction(() => {
        this.moonPhaseStats = stats;
      });
    } catch (error) {
      console.error('Failed to fetch moon phase stats', error);
    }
  }

  // Computed
  get fullMoonCircumstances() {
    return this.circumstances.filter(c => c.isFullMoon());
  }
}