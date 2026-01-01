"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmotionsService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class EmotionsService {
    constructor(emotionsRepository, entriesRepository) {
        this.emotionsRepository = emotionsRepository;
        this.entriesRepository = entriesRepository;
    }
    // Получить все эмоции из справочника
    async getAllEmotions() {
        return await this.emotionsRepository.findAll();
    }
    // Получить эмоции по категории
    async getEmotionsByCategory(category) {
        return await this.emotionsRepository.findByCategory(category);
    }
    // Получить эмоции для записи
    async getEmotionsForEntry(entryId, userId) {
        // Проверяем, что запись принадлежит пользователю
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        return await this.emotionsRepository.getForEntry(entryId);
    }
    // Привязать эмоции к записи
    async attachEmotionsToEntry(entryId, emotions, userId) {
        // Проверяем, что запись принадлежит пользователю
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        // Валидация эмоций
        for (const emotion of emotions) {
            if (emotion.emotion_id) {
                // Проверяем, что эмоция существует
                const exists = await this.emotionsRepository.findById(emotion.emotion_id);
                if (!exists) {
                    throw new AppError_1.AppError(`Emotion with id ${emotion.emotion_id} not found`, 400);
                }
            }
            // Проверяем интенсивность
            if (emotion.intensity < 1 || emotion.intensity > 10) {
                throw new AppError_1.AppError('Intensity must be between 1 and 10', 400);
            }
        }
        await this.emotionsRepository.attachToEntry(entryId, emotions);
        return { success: true, message: 'Emotions attached successfully' };
    }
    // Удалить эмоции из записи
    async detachEmotionsFromEntry(entryId, userId) {
        const entry = await this.entriesRepository.findById(entryId, userId);
        if (!entry) {
            throw new AppError_1.AppError('Entry not found', 404);
        }
        await this.emotionsRepository.detachFromEntry(entryId);
        return { success: true, message: 'Emotions detached successfully' };
    }
    // Статистика по эмоциям
    async getUserEmotionStats(userId, fromDate, toDate) {
        return await this.emotionsRepository.getUserEmotionStats(userId, fromDate, toDate);
    }
    // Самые частые эмоции
    async getMostFrequent(userId, limit = 10) {
        return await this.emotionsRepository.getMostFrequent(userId, limit);
    }
    // Распределение по категориям
    async getCategoryDistribution(userId, fromDate, toDate) {
        return await this.emotionsRepository.getCategoryDistribution(userId, fromDate, toDate);
    }
    // Эмоции по времени
    async getEmotionTimeline(userId, fromDate, toDate, granularity = 'day') {
        return await this.emotionsRepository.getEmotionTimeline(userId, fromDate, toDate, granularity);
    }
}
exports.EmotionsService = EmotionsService;
//# sourceMappingURL=EmotionsService.js.map