"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircumstancesService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class CircumstancesService {
    constructor(circumstancesRepository) {
        this.circumstancesRepository = circumstancesRepository;
    }
    async getAllCircumstances(userId, filters = {}) {
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
    async getCircumstanceById(id, userId) {
        const circumstance = await this.circumstancesRepository.findById(id, userId);
        if (!circumstance) {
            throw new AppError_1.AppError('Circumstance not found', 404);
        }
        return circumstance;
    }
    async createCircumstance(data, userId) {
        // Валидация
        this.validateCircumstanceData(data);
        const circumstance = await this.circumstancesRepository.create({
            ...data,
            user_id: userId
        });
        return circumstance;
    }
    async updateCircumstance(id, updates, userId) {
        const existingCircumstance = await this.getCircumstanceById(id, userId);
        if (!existingCircumstance) {
            throw new AppError_1.AppError('Circumstance not found', 404);
        }
        const updatedCircumstance = await this.circumstancesRepository.update(id, updates, userId);
        return updatedCircumstance;
    }
    async deleteCircumstance(id, userId) {
        const existingCircumstance = await this.getCircumstanceById(id, userId);
        if (!existingCircumstance) {
            throw new AppError_1.AppError('Circumstance not found', 404);
        }
        // Проверяем, не используется ли в entries или body_states
        // TODO: Добавить проверку связей
        await this.circumstancesRepository.deleteByUser(id, userId);
        return { success: true, message: 'Circumstance deleted successfully' };
    }
    async findNearestByTimestamp(userId, timestamp) {
        return await this.circumstancesRepository.findNearestByTimestamp(userId, timestamp);
    }
    async getWeatherStats(userId, fromDate, toDate) {
        return await this.circumstancesRepository.getWeatherStats(userId, fromDate, toDate);
    }
    async getMoonPhaseStats(userId, fromDate, toDate) {
        return await this.circumstancesRepository.getMoonPhaseStats(userId, fromDate, toDate);
    }
    validateCircumstanceData(data) {
        // Температура должна быть в разумных пределах
        if (data.temperature !== undefined && data.temperature !== null) {
            if (data.temperature < -50 || data.temperature > 60) {
                throw new AppError_1.AppError('temperature must be between -50 and 60 Celsius', 400);
            }
        }
        // Хотя бы одно поле должно быть заполнено
        const hasData = data.weather || data.temperature !== undefined ||
            data.moon_phase || data.global_event || data.notes;
        if (!hasData) {
            throw new AppError_1.AppError('At least one circumstance field must be provided', 400);
        }
    }
}
exports.CircumstancesService = CircumstancesService;
//# sourceMappingURL=CircumstancesService.js.map