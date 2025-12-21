import { BaseRepository } from './base/BaseRepository';

export class EntriesRepository extends BaseRepository {
  async getAll(filters = {}) {
    throw new Error('Not implemented');
  }

  async getById(id) {
    throw new Error('Not implemented');
  }




  static async createEntry(entryData) {
    console.log('=== EntriesRepository.createEntry ВЫЗВАН ===');
    console.log('Данные для API:', entryData);
    
    try {
      // Конвертируем в DTO если нужно
      const entryDTO = EntryMapper.toDTO(entryData);
      console.log('DTO для отправки:', entryDTO);
      
      // Вызываем API клиент
      const response = await EntriesAPIClient.create(entryDTO);
      console.log('Ответ API:', response);
      
      // Конвертируем обратно
      const entry = EntryMapper.fromDTO(response.data);
      console.log('Результат:', entry);
      
      return entry;
    } catch (error) {
      console.error('Ошибка в репозитории:', error);
      console.error('Детали ошибки:', error.response?.data || error.message);
      throw error;
    }
  }


  async update(id, entryData) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }

  async search(query, limit = 20) {
    throw new Error('Not implemented');
  }
}