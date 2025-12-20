"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntryService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class EntryService {
    constructor(entriesRepository) {
        this.entriesRepository = entriesRepository;
    }
    async getAllEntries(userId, filters = {}) {
        const entries = await this.entriesRepository.findByUserId(userId, filters);
        // Подсчитываем общее количество для пагинации
        const total = await this.entriesRepository.countByUserId(userId);
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
    async getEntryById(id, userId) {
        const entry = await this.entriesRepository.findById(id, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        // TODO: Добавить загрузку связанных данных (эмоции, теги, люди)
        return entry;
    }
    async createEntry(entryData, userId) {
        // Валидация данных
        this.validateEntryData(entryData);
        // Создаем запись
        const entry = await this.entriesRepository.create({
            ...entryData,
            user_id: userId
        });
        // TODO: Добавить обработку связанных сущностей
        return entry;
    }
    async updateEntry(id, updates, userId) {
        // Проверяем существование записи
        const existingEntry = await this.getEntryById(id, userId);
        if (!existingEntry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        // Обновляем запись
        const updatedEntry = await this.entriesRepository.update(id, updates, userId);
        return updatedEntry;
    }
    async deleteEntry(id, userId) {
        const existingEntry = await this.getEntryById(id, userId);
        if (!existingEntry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        await this.entriesRepository.deleteByUser(id, userId);
        return { success: true, message: 'Entry deleted successfully' };
    }
    validateEntryData(data) {
        if (!data.entry_type) {
            throw new AppError_1.AppError('Entry type is required', 400);
        }
        const validTypes = ['dream', 'memory', 'thought', 'plan'];
        if (!validTypes.includes(data.entry_type)) {
            throw new AppError_1.AppError(`Invalid entry type. Must be one of: ${validTypes.join(', ')}`, 400);
        }
        if (!data.content || data.content.trim().length === 0) {
            throw new AppError_1.AppError('Content is required', 400);
        }
        if (data.entry_type === 'plan' && !data.deadline) {
            throw new AppError_1.AppError('Plan must have a deadline', 400);
        }
    }
}
exports.EntryService = EntryService;
