"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class TagsService {
    constructor(tagsRepository, entriesRepository) {
        this.tagsRepository = tagsRepository;
        this.entriesRepository = entriesRepository;
    }
    async getAllTags(userId, filters = {}) {
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
    async getTagById(id, userId) {
        const tag = await this.tagsRepository.findById(id, userId);
        if (!tag) {
            throw new AppError_1.AppError('Tag not found', 404);
        }
        return tag;
    }
    async createTag(name, userId) {
        // Проверяем уникальность имени
        const existing = await this.tagsRepository.findByName(userId, name);
        if (existing) {
            throw new AppError_1.AppError('Tag with this name already exists', 400);
        }
        return await this.tagsRepository.create({ user_id: userId, name });
    }
    async updateTag(id, name, userId) {
        const existingTag = await this.tagsRepository.findById(id, userId);
        if (!existingTag) {
            throw new AppError_1.AppError('Tag not found', 404);
        }
        // Проверяем уникальность нового имени
        const duplicate = await this.tagsRepository.findByName(userId, name);
        if (duplicate && duplicate.id !== id) {
            throw new AppError_1.AppError('Tag with this name already exists', 400);
        }
        return await this.tagsRepository.update(id, name, userId);
    }
    async deleteTag(id, userId) {
        const existingTag = await this.tagsRepository.findById(id, userId);
        if (!existingTag) {
            throw new AppError_1.AppError('Tag not found', 404);
        }
        // ON DELETE CASCADE удалит все entry_tags автоматически
        await this.tagsRepository.deleteByUser(id, userId);
        return { success: true, message: 'Tag deleted successfully' };
    }
    // Теги для записи
    async getTagsForEntry(entryId, userId) {
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        return await this.tagsRepository.getForEntry(entryId);
    }
    // Привязать теги к записи
    async attachTagsToEntry(entryId, tagIds, userId) {
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        // Проверяем, что все теги существуют и принадлежат пользователю
        for (const tagId of tagIds) {
            const tag = await this.tagsRepository.findById(tagId, userId);
            if (!tag) {
                throw new AppError_1.AppError(`Tag with id ${tagId} not found`, 400);
            }
        }
        await this.tagsRepository.attachToEntry(entryId, tagIds);
        return { success: true, message: 'Tags attached successfully' };
    }
    // Отвязать все теги
    async detachTagsFromEntry(entryId, userId) {
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        await this.tagsRepository.detachFromEntry(entryId);
        return { success: true, message: 'Tags detached successfully' };
    }
    // Записи по тегу
    async getEntriesByTag(tagId, userId, limit = 50) {
        const tag = await this.tagsRepository.findById(tagId, userId);
        if (!tag) {
            throw new AppError_1.AppError('Tag not found', 404);
        }
        return await this.tagsRepository.getEntriesByTag(tagId, userId, limit);
    }
    // Самые используемые теги
    async getMostUsed(userId, limit = 20) {
        return await this.tagsRepository.getMostUsed(userId, limit);
    }
    // Неиспользуемые теги
    async getUnused(userId) {
        return await this.tagsRepository.getUnused(userId);
    }
    // Создать или найти (для автодополнения)
    async findOrCreateTag(name, userId) {
        return await this.tagsRepository.findOrCreate(userId, name);
    }
    // Похожие теги
    async getSimilarTags(tagId, userId, limit = 5) {
        const tag = await this.tagsRepository.findById(tagId, userId);
        if (!tag) {
            throw new AppError_1.AppError('Tag not found', 404);
        }
        return await this.tagsRepository.getSimilar(userId, tagId, limit);
    }
}
exports.TagsService = TagsService;
