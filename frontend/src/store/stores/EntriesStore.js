// store/stores/EntriesStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import { EntriesAPIClient } from '../../core/adapters/api/clients/EntriesAPIClient';
import apiClient from '../../core/adapters/config';

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
      // Проверяем структуру данных перед отправкой
      console.log('EntriesStore.createEntry данные:', entryData);
      
      // Должны быть: entry_type, content, deadline (опционально)
      const validData = {
        entry_type: entryData.entry_type,
        content: entryData.content,
        ...(entryData.deadline && { deadline: entryData.deadline }),
        ...(entryData.body_state_id && { body_state_id: entryData.body_state_id }),
        ...(entryData.circumstance_id && { circumstance_id: entryData.circumstance_id }),
        is_completed: false
      };
      
      const createdEntry = await this.repository.create(validData);
      
      runInAction(() => {
        this.entries.unshift(createdEntry);
        this.isLoading = false;
      });
      
      return createdEntry;
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

  // МЕТОДЫ ДЛЯ СВЯЗЕЙ

  async addEmotionsToEntry(entryId, emotionsData) {
    try {
      const formattedEmotions = Array.isArray(emotionsData) 
        ? emotionsData.map(emotion => ({
            emotion_id: emotion.id || emotion.emotion_id,
            intensity: emotion.intensity || 5
          }))
        : [];
      
      const response = await apiClient.post(`/entries/${entryId}/emotions`, {
        emotions: formattedEmotions
      });
      
      return response;
    } catch (error) {
      console.error('Failed to add emotions to entry:', error);
      throw error;
    }
  }

  async addTagsToEntry(entryId, tagsData) {
    try {
      const tagNames = Array.isArray(tagsData)
        ? tagsData.map(tag => typeof tag === 'string' ? tag : tag.name)
        : [];
      
      const response = await apiClient.post(`/entries/${entryId}/tags`, {
        tags: tagNames
      });
      
      return response;
    } catch (error) {
      console.error('Failed to add tags to entry:', error);
      throw error;
    }
  }

  async addPeopleToEntry(entryId, peopleData) {
    try {
      const response = await apiClient.post(`/entries/${entryId}/people`, {
        people: peopleData
      });
      
      return response;
    } catch (error) {
      console.error('Failed to add people to entry:', error);
      throw error;
    }
  }

  // Computed
  get dreamEntries() {
    return this.entries.filter(e => e.type === 'dream');
  }

  get memoryEntries() {
    return this.entries.filter(e => e.type === 'memory');
  }

  get thoughtEntries() {
    return this.entries.filter(e => e.type === 'thought');
  }

  get planEntries() {
    return this.entries.filter(e => e.type === 'plan');
  }

  get overduePlans() {
    return this.entries.filter(e => {
      if (e.type !== 'plan' || !e.deadline) return false;
      return new Date(e.deadline) < new Date() && !e.isCompleted;
    });
  }
}