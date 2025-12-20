// ============================================
// src/modules/circumstances/services/CircumstancesService.ts
// ============================================
import { CircumstancesRepository } from '../repositories/CircumstancesRepository';
import { AppError } from '../../../shared/errors/AppError';

export class CircumstancesService {
  constructor(private circumstancesRepository: CircumstancesRepository) {}

  async getAllCircumstances(userId: number, filters: any = {}) {
    const circumstances = await this.circumstancesRepository.findByUserId(userId, filters);
    const total = await this.circumstancesRepository.countByUserId(userId, filters);
    
    return {
      circumstances,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        totalPages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async getCircumstanceById(id: number, userId: number) {
    const circumstance = await this.circumstancesRepository.findById(id, userId);
    
    if (!circumstance) {
      throw new AppError('Circumstance not found', 404);
    }
    
    return circumstance;
  }

  async createCircumstance(data: any, userId: number) {
    // Валидация
    this.validateCircumstanceData(data);

    const circumstance = await this.circumstancesRepository.create({
      ...data,
      user_id: userId
    });
    
    return circumstance;
  }

  async updateCircumstance(id: number, updates: any, userId: number) {
    const existingCircumstance = await this.getCircumstanceById(id, userId);
    
    if (!existingCircumstance) {
      throw new AppError('Circumstance not found', 404);
    }
    
    const updatedCircumstance = await this.circumstancesRepository.update(id, updates, userId);
    
    return updatedCircumstance;
  }

  async deleteCircumstance(id: number, userId: number) {
    const existingCircumstance = await this.getCircumstanceById(id, userId);
    
    if (!existingCircumstance) {
      throw new AppError('Circumstance not found', 404);
    }
    
    // Проверяем, не используется ли в entries или body_states
    // TODO: Добавить проверку связей
    
    await this.circumstancesRepository.deleteByUser(id, userId);
    
    return { success: true, message: 'Circumstance deleted successfully' };
  }

  async findNearestByTimestamp(userId: number, timestamp: Date) {
    return await this.circumstancesRepository.findNearestByTimestamp(userId, timestamp);
  }

  async getWeatherStats(userId: number, fromDate?: Date, toDate?: Date) {
    return await this.circumstancesRepository.getWeatherStats(userId, fromDate, toDate);
  }

  async getMoonPhaseStats(userId: number, fromDate?: Date, toDate?: Date) {
    return await this.circumstancesRepository.getMoonPhaseStats(userId, fromDate, toDate);
  }

  private validateCircumstanceData(data: any) {
    // Температура должна быть в разумных пределах
    if (data.temperature !== undefined && data.temperature !== null) {
      if (data.temperature < -50 || data.temperature > 60) {
        throw new AppError('temperature must be between -50 and 60 Celsius', 400);
      }
    }

    // Хотя бы одно поле должно быть заполнено
    const hasData = data.weather || data.temperature !== undefined || 
                    data.moon_phase || data.global_event || data.notes;
    
    if (!hasData) {
      throw new AppError('At least one circumstance field must be provided', 400);
    }
  }
}