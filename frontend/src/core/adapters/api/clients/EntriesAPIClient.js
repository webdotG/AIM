import { apiClient } from '../../config';
import { EntriesRepository } from '../../../repositories/EntriesRepository';
import { EntryMapper } from '../mappers/EntryMapper';

export class EntriesAPIClient extends EntriesRepository {
  async getAll(filters = {}) {
    const response = await apiClient.get('/entries', { params: filters });
    return {
      entries: EntryMapper.toDomainArray(response.entries || []),
      pagination: response.pagination || {},
    };
  }

  async getById(id) {
    const response = await apiClient.get(`/entries/${id}`);
    return EntryMapper.toDomain(response);
  }

  async create(entryData) {
    // Конвертируем entry_type (ваш бэкенд использует entry_type, а не type)
    const dto = {
      entry_type: entryData.type, // маппинг field names
      content: entryData.content,
      emotions: entryData.emotions || [],
      people: entryData.people || [],
      tags: entryData.tags || [],
      is_completed: entryData.isCompleted || false,
      deadline: entryData.deadline?.toISOString() || null
    };
    
    const response = await apiClient.post('/entries', dto);
    return EntryMapper.toDomain(response);
  }

  async update(id, entryData) {
    const dto = {
      entry_type: entryData.type,
      content: entryData.content,
      emotions: entryData.emotions || [],
      people: entryData.people || [],
      tags: entryData.tags || [],
      is_completed: entryData.isCompleted || false,
      deadline: entryData.deadline?.toISOString() || null
    };
    
    const response = await apiClient.put(`/entries/${id}`, dto);
    return EntryMapper.toDomain(response);
  }

  async delete(id) {
    await apiClient.delete(`/entries/${id}`);
    return true;
  }

  async search(query, limit = 20) {
    const response = await apiClient.get('/entries/search', { 
      params: { query, limit } 
    });
    return EntryMapper.toDomainArray(response || []);
  }
}