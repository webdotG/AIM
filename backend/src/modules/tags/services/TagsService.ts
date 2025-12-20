import { TagsRepository } from '../repositories/TagsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
import { AppError } from '../../../shared/errors/AppError';

export class TagsService {
  constructor(
    private tagsRepository: TagsRepository,
    private entriesRepository: EntriesRepository
  ) {}

  async getAllTags(userId: number, filters: any = {}) {
    const tags = await this.tagsRepository.findByUserId(userId, filters);
    const total = await this.tagsRepository.countByUserId(userId, filters);
    
    return {
      tags,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 100,
        total,
        totalPages: Math.ceil(total / (filters.limit || 100))
      }
    };
  }

  async getTagById(id: number, userId: number) {
    const tag = await this.tagsRepository.findById(id, userId);
    
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    return tag;
  }

  async createTag(name: string, userId: number) {
    // Проверяем уникальность имени
    const existing = await this.tagsRepository.findByName(userId, name);
    
    if (existing) {
      throw new AppError('Tag with this name already exists', 400);
    }

    return await this.tagsRepository.create({ user_id: userId, name });
  }

  async updateTag(id: number, name: string, userId: number) {
    const existingTag = await this.tagsRepository.findById(id, userId);
    
    if (!existingTag) {
      throw new AppError('Tag not found', 404);
    }

    // Проверяем уникальность нового имени
    const duplicate = await this.tagsRepository.findByName(userId, name);
    
    if (duplicate && duplicate.id !== id) {
      throw new AppError('Tag with this name already exists', 400);
    }

    return await this.tagsRepository.update(id, name, userId);
  }

  async deleteTag(id: number, userId: number) {
    const existingTag = await this.tagsRepository.findById(id, userId);
    
    if (!existingTag) {
      throw new AppError('Tag not found', 404);
    }

    // ON DELETE CASCADE удалит все entry_tags автоматически
    await this.tagsRepository.deleteByUser(id, userId);

    return { success: true, message: 'Tag deleted successfully' };
  }

  // Теги для записи
  async getTagsForEntry(entryId: string, userId: number) {
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    return await this.tagsRepository.getForEntry(entryId);
  }

  // Привязать теги к записи
  async attachTagsToEntry(entryId: string, tagIds: number[], userId: number) {
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    // Проверяем, что все теги существуют и принадлежат пользователю
    for (const tagId of tagIds) {
      const tag = await this.tagsRepository.findById(tagId, userId);
      if (!tag) {
        throw new AppError(`Tag with id ${tagId} not found`, 400);
      }
    }

    await this.tagsRepository.attachToEntry(entryId, tagIds);

    return { success: true, message: 'Tags attached successfully' };
  }

  // Отвязать все теги
  async detachTagsFromEntry(entryId: string, userId: number) {
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    await this.tagsRepository.detachFromEntry(entryId);

    return { success: true, message: 'Tags detached successfully' };
  }

  // Записи по тегу
  async getEntriesByTag(tagId: number, userId: number, limit: number = 50) {
    const tag = await this.tagsRepository.findById(tagId, userId);
    
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    return await this.tagsRepository.getEntriesByTag(tagId, userId, limit);
  }

  // Самые используемые теги
  async getMostUsed(userId: number, limit: number = 20) {
    return await this.tagsRepository.getMostUsed(userId, limit);
  }

  // Неиспользуемые теги
  async getUnused(userId: number) {
    return await this.tagsRepository.getUnused(userId);
  }

  // Создать или найти (для автодополнения)
  async findOrCreateTag(name: string, userId: number) {
    return await this.tagsRepository.findOrCreate(userId, name);
  }

  // Похожие теги
  async getSimilarTags(tagId: number, userId: number, limit: number = 5) {
    const tag = await this.tagsRepository.findById(tagId, userId);
    
    if (!tag) {
      throw new AppError('Tag not found', 404);
    }

    return await this.tagsRepository.getSimilar(userId, tagId, limit);
  }
}
