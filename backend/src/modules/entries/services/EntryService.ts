
// src/modules/entries/services/EntryService.ts
import { EntriesRepository } from '../repositories/EntriesRepository';
import { EntryEmotionsRepository } from '../repositories/EntryEmotionsRepository';
import { EntryTagsRepository } from '../repositories/EntryTagsRepository';
import { EntryPeopleRepository } from '../repositories/EntryPeopleRepository';
import { AppError } from '../../../shared/errors/AppError';

export class EntryService {
  private entriesRepository: EntriesRepository;
  private entryEmotionsRepository: EntryEmotionsRepository;
  private entryTagsRepository: EntryTagsRepository;
  private entryPeopleRepository: EntryPeopleRepository;

  constructor(
    entriesRepository: EntriesRepository,
    entryEmotionsRepository?: EntryEmotionsRepository,
    entryTagsRepository?: EntryTagsRepository,
    entryPeopleRepository?: EntryPeopleRepository
  ) {
    this.entriesRepository = entriesRepository;
    
    const pool = (entriesRepository as any).pool; // Временное решение
    
    this.entryEmotionsRepository = entryEmotionsRepository || new EntryEmotionsRepository(pool);
    this.entryTagsRepository = entryTagsRepository || new EntryTagsRepository(pool);
    this.entryPeopleRepository = entryPeopleRepository || new EntryPeopleRepository(pool);
  }

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
    // console.log('=== GET ENTRY BY ID ===');
    // console.log('Entry ID:', id);
    // console.log('User ID:', userId);
    
    // Сначала ищем запись без проверки пользователя
    const entry = await this.entriesRepository.findById(id);
    // console.log('Found entry:', entry);
    
    if (!entry) {
      // console.log('Entry not found, throwing 404');
      throw new AppError('Entry not found', 404);
    }
    
    // Проверяем права доступа
    if (entry.user_id !== userId) {
      // console.log('Access denied for user', userId, 'to entry of user', entry.user_id);
      throw new AppError('Access denied', 403);
    }
    
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

    // Добавьте эти методы для relationships:
  async addEmotionToEntry(entryId: string, emotionId: number, intensity: number, userId: number) {
    // Проверяем что запись принадлежит пользователю
    await this.getEntryById(entryId, userId);
    
    // Проверяем что эмоция существует
    const emotionExists = await this.checkEmotionExists(emotionId);
    if (!emotionExists) {
      throw new AppError('Emotion not found', 404);
    }
    
    const result = await this.entryEmotionsRepository.addEmotionToEntry(entryId, emotionId, intensity);
    return result;
  }

  async addTagToEntry(entryId: string, tagId: number, userId: number) {
    await this.getEntryById(entryId, userId);
    
    // Проверяем что тег существует и принадлежит пользователю
    const tagExists = await this.checkTagExists(tagId, userId);
    if (!tagExists) {
      throw new AppError('Tag not found or access denied', 404);
    }
    
    const result = await this.entryTagsRepository.addTagToEntry(entryId, tagId);
    return result;
  }

  async addPersonToEntry(entryId: string, personId: number, userId: number, role?: string) {
    await this.getEntryById(entryId, userId);
    
    // Проверяем что человек существует и принадлежит пользователю
    const personExists = await this.checkPersonExists(personId, userId);
    if (!personExists) {
      throw new AppError('Person not found or access denied', 404);
    }
    
    const result = await this.entryPeopleRepository.addPersonToEntry(entryId, personId, role);
    return result;
  }

  // Вспомогательные методы для проверки существования сущностей
  private async checkEmotionExists(emotionId: number): Promise<boolean> {
    try {
    const result = await (this.entriesRepository as any).pool.query(
      'SELECT id FROM emotions WHERE id = $1',
      [emotionId]
    );
    return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async checkTagExists(tagId: number, userId: number): Promise<boolean> {
    try {
      const result = await (this.entriesRepository as any).pool.query(
        'SELECT id FROM tags WHERE id = $1 AND user_id = $2',
        [tagId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async checkPersonExists(personId: number, userId: number): Promise<boolean> {
    try {
      const result = await (this.entriesRepository as any).pool.query(
        'SELECT id FROM people WHERE id = $1 AND user_id = $2',
        [personId, userId]
      );
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }

}
