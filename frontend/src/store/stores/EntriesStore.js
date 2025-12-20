import { makeAutoObservable, runInAction } from 'mobx';
import { EntriesAPIClient } from '../../core/adapters/api/clients/EntriesAPIClient';

export class EntriesStore {
  entries = [];
  currentEntry = null;
  isLoading = false;
  error = null;
  pagination = null;

  repository = new EntriesAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentEntry(entry) {
    this.currentEntry = entry;
  }

  clearCurrentEntry() {
    this.currentEntry = null;
  }

  async fetchEntries(filters = {}) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await this.repository.getAll(filters);
      
      runInAction(() => {
        this.entries = response.entries;
        this.pagination = response.pagination;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to fetch entries';
        this.isLoading = false;
      });
    }
  }

  async fetchEntryById(id) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const entry = await this.repository.getById(id);
      
      runInAction(() => {
        this.currentEntry = entry;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to fetch entry';
        this.isLoading = false;
      });
    }
  }

  async createEntry(entryData) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const entry = await this.repository.create(entryData);
      
      runInAction(() => {
        this.entries.unshift(entry); // Добавляем в начало
        this.isLoading = false;
      });
      
      return entry;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to create entry';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async updateEntry(id, entryData) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const updatedEntry = await this.repository.update(id, entryData);
      
      runInAction(() => {
        const index = this.entries.findIndex(e => e.id === id);
        if (index !== -1) {
          this.entries[index] = updatedEntry;
        }
        if (this.currentEntry?.id === id) {
          this.currentEntry = updatedEntry;
        }
        this.isLoading = false;
      });
      
      return updatedEntry;
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to update entry';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async deleteEntry(id) {
    this.isLoading = true;
    this.error = null;
    
    try {
      await this.repository.delete(id);
      
      runInAction(() => {
        this.entries = this.entries.filter(e => e.id !== id);
        if (this.currentEntry?.id === id) {
          this.currentEntry = null;
        }
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to delete entry';
        this.isLoading = false;
      });
      throw error;
    }
  }

  async searchEntries(query, limit = 20) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const results = await this.repository.search(query, limit);
      
      runInAction(() => {
        this.entries = results;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Search failed';
        this.isLoading = false;
      });
    }
  }

  // Computed
  get dreamEntries() {
    return this.entries.filter(e => e.isDream());
  }

  get memoryEntries() {
    return this.entries.filter(e => e.isMemory());
  }

  get thoughtEntries() {
    return this.entries.filter(e => e.isThought());
  }

  get planEntries() {
    return this.entries.filter(e => e.isPlan());
  }

  get overduePlans() {
    return this.entries.filter(e => e.isOverdue());
  }
}