// ============================================
// src/modules/entries/services/EntryService.ts
// ============================================
import { EntriesRepository } from '../repositories/EntriesRepository';
import { AppError } from '../../../shared/errors/AppError';

export class EntryService {
  constructor(private entriesRepository: EntriesRepository) {}

  async getAllEntries(userId: number, filters: any = {}) {
    const entries = await this.entriesRepository.findByUserId(userId, filters);
    
    // Подсчитываем общее количество для пагинации
    const total = await this.entriesRepository.countByUserId(userId, filters);
    
    return {
      entries,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        totalPages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async getEntryById(id: string, userId: number) {
    const entry = await this.entriesRepository.findById(id, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }
    
    // TODO: Добавить загрузку связанных данных (эмоции, теги, люди, body_state, circumstance)
    
    return entry;
  }

  async createEntry(entryData: any, userId: number) {
    // Валидация данных
    this.validateEntryData(entryData);
    
    // Проверяем существование body_state_id
    if (entryData.body_state_id) {
      // TODO: Проверить, что body_state принадлежит пользователю
    }

    // Проверяем существование circumstance_id
    if (entryData.circumstance_id) {
      // TODO: Проверить, что circumstance принадлежит пользователю
    }
    
    // Создаем запись
    const entry = await this.entriesRepository.create({
      ...entryData,
      user_id: userId
    });
    
    // TODO: Добавить обработку связанных сущностей (emotions, people, tags)
    
    return entry;
  }

  async updateEntry(id: string, updates: any, userId: number) {
    // Проверяем существование записи
    const existingEntry = await this.getEntryById(id, userId);
    
    if (!existingEntry) {
      throw new AppError('Entry not found', 404);
    }
    
    // Обновляем запись
    const updatedEntry = await this.entriesRepository.update(id, updates, userId);
    
    return updatedEntry;
  }

  async deleteEntry(id: string, userId: number) {
    const existingEntry = await this.getEntryById(id, userId);
    
    if (!existingEntry) {
      throw new AppError('Entry not found', 404);
    }
    
    await this.entriesRepository.deleteByUser(id, userId);
    
    return { success: true, message: 'Entry deleted successfully' };
  }

  private validateEntryData(data: any) {
    if (!data.entry_type) {
      throw new AppError('Entry type is required', 400);
    }
    
    const validTypes = ['dream', 'memory', 'thought', 'plan'];
    if (!validTypes.includes(data.entry_type)) {
      throw new AppError(`Invalid entry type. Must be one of: ${validTypes.join(', ')}`, 400);
    }
    
    if (!data.content || data.content.trim().length === 0) {
      throw new AppError('Content is required', 400);
    }
    
    // План должен иметь deadline
    if (data.entry_type === 'plan' && !data.deadline) {
      throw new AppError('Plan must have a deadline', 400);
    }

    // body_state_id и circumstance_id опциональны, но если указаны, должны быть числами
    if (data.body_state_id !== undefined && data.body_state_id !== null) {
      if (typeof data.body_state_id !== 'number' || data.body_state_id <= 0) {
        throw new AppError('body_state_id must be a positive number', 400);
      }
    }

    if (data.circumstance_id !== undefined && data.circumstance_id !== null) {
      if (typeof data.circumstance_id !== 'number' || data.circumstance_id <= 0) {
        throw new AppError('circumstance_id must be a positive number', 400);
      }
    }
  }
}
