// store/stores/TagsStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import { apiClient } from '../../core/adapters/config';

export class TagsStore {
  tags = [];
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchTags(filters = {}) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await apiClient.get('/tags', { params: filters });
      
      runInAction(() => {
        this.tags = response.data.tags || response.tags || [];
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Failed to fetch tags';
        this.isLoading = false;
      });
    }
  }

  async createTag(tagName) {
    try {
      const response = await apiClient.post('/tags', { name: tagName });
      
      runInAction(() => {
        this.tags.push(response.data);
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  }

  // ✅ ГЛАВНЫЙ МЕТОД ДЛЯ ФОРМЫ!
  async findOrCreateTag(tagName) {
    try {
      // API: POST /api/v1/tags/find-or-create
      const response = await apiClient.post('/tags/find-or-create', { 
        name: tagName 
      });
      
      // response.data = { id, user_id, name, created_at }
      return response.data;
    } catch (error) {
      console.error('Failed to find or create tag:', error);
      throw error;
    }
  }

  async deleteTag(tagId) {
    try {
      await apiClient.delete(`/tags/${tagId}`);
      
      runInAction(() => {
        this.tags = this.tags.filter(t => t.id !== tagId);
      });
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  }
}