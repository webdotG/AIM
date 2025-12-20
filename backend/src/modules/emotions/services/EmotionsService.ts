import { EmotionsRepository } from '../repositories/EmotionsRepository';
import { EntriesRepository } from '../../entries/repositories/EntriesRepository';
import { AppError } from '../../../shared/errors/AppError';

export class EmotionsService {
  constructor(
    private emotionsRepository: EmotionsRepository,
    private entriesRepository: EntriesRepository
  ) {}

  // Получить все эмоции из справочника
  async getAllEmotions() {
    return await this.emotionsRepository.findAll();
  }

  // Получить эмоции по категории
  async getEmotionsByCategory(category: 'positive' | 'negative' | 'neutral') {
    return await this.emotionsRepository.findByCategory(category);
  }

  // Получить эмоции для записи
  async getEmotionsForEntry(entryId: string, userId: number) {
    // Проверяем, что запись принадлежит пользователю
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    return await this.emotionsRepository.getForEntry(entryId);
  }

  // Привязать эмоции к записи
  async attachEmotionsToEntry(entryId: string, emotions: any[], userId: number) {
    // Проверяем, что запись принадлежит пользователю
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    // Валидация эмоций
    for (const emotion of emotions) {
      if (emotion.emotion_id) {
        // Проверяем, что эмоция существует
        const exists = await this.emotionsRepository.findById(emotion.emotion_id);
        if (!exists) {
          throw new AppError(`Emotion with id ${emotion.emotion_id} not found`, 400);
        }
      }

      // Проверяем интенсивность
      if (emotion.intensity < 1 || emotion.intensity > 10) {
        throw new AppError('Intensity must be between 1 and 10', 400);
      }
    }

    await this.emotionsRepository.attachToEntry(entryId, emotions);

    return { success: true, message: 'Emotions attached successfully' };
  }

  // Удалить эмоции из записи
  async detachEmotionsFromEntry(entryId: string, userId: number) {
    const entry = await this.entriesRepository.findById(entryId, userId);
    
    if (!entry) {
      throw new AppError('Entry not found', 404);
    }

    await this.emotionsRepository.detachFromEntry(entryId);

    return { success: true, message: 'Emotions detached successfully' };
  }

  // Статистика по эмоциям
  async getUserEmotionStats(userId: number, fromDate?: Date, toDate?: Date) {
    return await this.emotionsRepository.getUserEmotionStats(userId, fromDate, toDate);
  }

  // Самые частые эмоции
  async getMostFrequent(userId: number, limit: number = 10) {
    return await this.emotionsRepository.getMostFrequent(userId, limit);
  }

  // Распределение по категориям
  async getCategoryDistribution(userId: number, fromDate?: Date, toDate?: Date) {
    return await this.emotionsRepository.getCategoryDistribution(userId, fromDate, toDate);
  }

  // Эмоции по времени
  async getEmotionTimeline(userId: number, fromDate: Date, toDate: Date, granularity: 'day' | 'week' | 'month' = 'day') {
    return await this.emotionsRepository.getEmotionTimeline(userId, fromDate, toDate, granularity);
  }
}