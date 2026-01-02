// store/stores/RelationsStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import { apiClient } from '../../core/adapters/config';

export class RelationsStore {
  relations = [];
  relationTypes = [];
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

async createRelationForEntry(entryId, relationData) {
  try {
    const payload = {
      from_entry_id: relationData.direction === 'from' ? entryId : relationData.targetEntry.id,
      to_entry_id: relationData.direction === 'to' ? entryId : relationData.targetEntry.id,
      relation_type: relationData.type.id,
      description: relationData.description
    };
    
    const response = await apiClient.post('/relations', payload);
    
    runInAction(() => {
      this.relations.push(response.data);
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to create relation:', error);
    throw error;
  }
}

  async createRelation(relationData) {
    try {
      const response = await apiClient.post('/relations', relationData);
      
      runInAction(() => {
        this.relations.push(response.data);
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to create relation:', error);
      throw error;
    }
  }
  
  async fetchRelationTypes() {
    try {
      const response = await apiClient.get('/relations/types');
      this.relationTypes = response.data || [];
    } catch (error) {
      console.error('Failed to fetch relation types:', error);
    }
  }

  async fetchEntryRelations(entryId) {
    try {
      const response = await apiClient.get(`/relations/entry/${entryId}`);
      this.relations = response.data || [];
    } catch (error) {
      console.error('Failed to fetch entry relations:', error);
    }
  }

  async deleteRelation(id) {
    try {
      await apiClient.delete(`/relations/${id}`);
      
      runInAction(() => {
        this.relations = this.relations.filter(r => r.id !== id);
      });
    } catch (error) {
      console.error('Failed to delete relation:', error);
      throw error;
    }
  }

}