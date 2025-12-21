"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyStatesService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class BodyStatesService {
    constructor(bodyStatesRepository) {
        this.bodyStatesRepository = bodyStatesRepository;
    }
    async getAllBodyStates(userId, filters = {}) {
        const bodyStates = await this.bodyStatesRepository.findByUserId(userId, filters);
        const total = await this.bodyStatesRepository.countByUserId(userId, filters);
        return {
            body_states: bodyStates,
            pagination: {
                page: filters.page || 1,
                limit: filters.limit || 50,
                total,
                totalPages: Math.ceil(total / (filters.limit || 50))
            }
        };
    }
    async getBodyStateById(id, userId) {
        const bodyState = await this.bodyStatesRepository.findById(id, userId);
        if (!bodyState) {
            throw new AppError_1.AppError('Body state not found', 404);
        }
        return bodyState;
    }
    async createBodyState(data, userId) {
        // Валидация
        this.validateBodyStateData(data);
        // Проверяем circumstance_id, если указан
        if (data.circumstance_id) {
            // TODO: Проверить существование circumstance
        }
        const bodyState = await this.bodyStatesRepository.create({
            ...data,
            user_id: userId
        });
        return bodyState;
    }
    async updateBodyState(id, updates, userId) {
        const existingBodyState = await this.getBodyStateById(id, userId);
        if (!existingBodyState) {
            throw new AppError_1.AppError('Body state not found', 404);
        }
        const updatedBodyState = await this.bodyStatesRepository.update(id, updates, userId);
        return updatedBodyState;
    }
    async deleteBodyState(id, userId) {
        const existingBodyState = await this.getBodyStateById(id, userId);
        if (!existingBodyState) {
            throw new AppError_1.AppError('Body state not found', 404);
        }
        await this.bodyStatesRepository.deleteByUser(id, userId);
        return { success: true, message: 'Body state deleted successfully' };
    }
    async findNearestByTimestamp(userId, timestamp) {
        return await this.bodyStatesRepository.findNearestByTimestamp(userId, timestamp);
    }
    validateBodyStateData(data) {
        // HP и Energy должны быть в диапазоне 0-100
        if (data.health_points !== undefined && data.health_points !== null) {
            if (data.health_points < 0 || data.health_points > 100) {
                throw new AppError_1.AppError('health_points must be between 0 and 100', 400);
            }
        }
        if (data.energy_points !== undefined && data.energy_points !== null) {
            if (data.energy_points < 0 || data.energy_points > 100) {
                throw new AppError_1.AppError('energy_points must be between 0 and 100', 400);
            }
        }
        // Если указан location_point, должны быть latitude и longitude
        if (data.location_point) {
            if (!data.location_point.latitude || !data.location_point.longitude) {
                throw new AppError_1.AppError('location_point must have latitude and longitude', 400);
            }
        }
    }
}
exports.BodyStatesService = BodyStatesService;
