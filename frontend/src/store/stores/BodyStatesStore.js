import { makeAutoObservable, runInAction } from 'mobx';
import { BodyStatesAPIClient } from '../../core/adapters/api/clients/BodyStatesAPIClient';

export class BodyStatesStore {
  bodyStates = [];
  currentBodyState = null;
  isLoading = false;
  error = null;
  pagination = null;

  repository = new BodyStatesAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  async fetchBodyStates(filters = {}) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await this.repository.getAll(filters);
      
      runInAction(() => {
        this.bodyStates = response.bodyStates;
        this.pagination = response.pagination;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to fetch body states';
        this.isLoading = false;
      });
    }
  }

  async createBodyState(data) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const bodyState = await this.repository.create(data);
      
      runInAction(() => {
        this.bodyStates.unshift(bodyState);
        this.isLoading = false;
      });
      
      return bodyState;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to create body state';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async updateBodyState(id, data) {
    try {
      const updated = await this.repository.update(id, data);
      
      runInAction(() => {
        const index = this.bodyStates.findIndex(bs => bs.id === id);
        if (index !== -1) {
          this.bodyStates[index] = updated;
        }
      });
      
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async deleteBodyState(id) {
    try {
      await this.repository.delete(id);
      
      runInAction(() => {
        this.bodyStates = this.bodyStates.filter(bs => bs.id !== id);
      });
    } catch (error) {
      throw error;
    }
  }

  // Computed
  get criticalHealthStates() {
    return this.bodyStates.filter(bs => bs.isHealthCritical());
  }

  get lowEnergyStates() {
    return this.bodyStates.filter(bs => bs.isEnergyLow());
  }
}