"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class SkillsService {
    constructor(skillsRepository) {
        this.skillsRepository = skillsRepository;
    }
    async getAllSkills(userId, filters = {}) {
        const skills = await this.skillsRepository.findByUserId(userId, filters);
        const total = await this.skillsRepository.countByUserId(userId, filters);
        return {
            skills,
            pagination: {
                page: filters.page || 1,
                limit: filters.limit || 50,
                total,
                totalPages: Math.ceil(total / (filters.limit || 50))
            }
        };
    }
    async getSkillById(id, userId) {
        const skill = await this.skillsRepository.findById(id, userId);
        if (!skill) {
            throw new AppError_1.AppError('Skill not found', 404);
        }
        // Получаем историю прогресса
        const progressHistory = await this.skillsRepository.getProgressHistory(id, 50);
        return {
            ...skill,
            progress_history: progressHistory
        };
    }
    async createSkill(data, userId) {
        // Валидация
        this.validateSkillData(data);
        // Проверяем уникальность имени
        const existingSkills = await this.skillsRepository.findByUserId(userId);
        const duplicate = existingSkills.find(s => s.name.toLowerCase() === data.name.toLowerCase());
        if (duplicate) {
            throw new AppError_1.AppError('Skill with this name already exists', 400);
        }
        const skill = await this.skillsRepository.create({
            ...data,
            user_id: userId
        });
        return skill;
    }
    async updateSkill(id, updates, userId) {
        const existingSkill = await this.skillsRepository.findById(id, userId);
        if (!existingSkill) {
            throw new AppError_1.AppError('Skill not found', 404);
        }
        // Если обновляем имя, проверяем уникальность
        if (updates.name && updates.name !== existingSkill.name) {
            const allSkills = await this.skillsRepository.findByUserId(userId);
            const duplicate = allSkills.find(s => s.id !== id && s.name.toLowerCase() === updates.name.toLowerCase());
            if (duplicate) {
                throw new AppError_1.AppError('Skill with this name already exists', 400);
            }
        }
        const updatedSkill = await this.skillsRepository.update(id, updates, userId);
        return updatedSkill;
    }
    async deleteSkill(id, userId) {
        const existingSkill = await this.skillsRepository.findById(id, userId);
        if (!existingSkill) {
            throw new AppError_1.AppError('Skill not found', 404);
        }
        // ON DELETE CASCADE удалит все skill_progress автоматически
        await this.skillsRepository.deleteByUser(id, userId);
        return { success: true, message: 'Skill deleted successfully' };
    }
    async addProgress(skillId, progressData, userId) {
        // Проверяем существование навыка
        const skill = await this.skillsRepository.findById(skillId, userId);
        if (!skill) {
            throw new AppError_1.AppError('Skill not found', 404);
        }
        // Проверяем entry_id или body_state_id
        if (progressData.entry_id) {
            // TODO: Проверить, что entry принадлежит пользователю
        }
        if (progressData.body_state_id) {
            // TODO: Проверить, что body_state принадлежит пользователю
        }
        // Добавляем запись в skill_progress
        const progress = await this.skillsRepository.addProgress({
            skill_id: skillId,
            ...progressData
        });
        // Обновляем experience и level
        const updateResult = await this.skillsRepository.updateExperienceAndLevel(skillId, progressData.experience_gained || 10);
        return {
            progress,
            skill: updateResult.skill,
            level_up: updateResult.level_up,
            levels_gained: updateResult.levels_gained
        };
    }
    async getProgressHistory(skillId, userId) {
        const skill = await this.skillsRepository.findById(skillId, userId);
        if (!skill) {
            throw new AppError_1.AppError('Skill not found', 404);
        }
        return await this.skillsRepository.getProgressHistory(skillId);
    }
    async getCategories(userId) {
        return await this.skillsRepository.getCategories(userId);
    }
    async getTopSkills(userId, limit = 10) {
        return await this.skillsRepository.getTopSkills(userId, limit);
    }
    validateSkillData(data) {
        if (!data.name || data.name.trim().length === 0) {
            throw new AppError_1.AppError('Skill name is required', 400);
        }
        if (data.current_level !== undefined) {
            if (data.current_level < 1 || data.current_level > 100) {
                throw new AppError_1.AppError('current_level must be between 1 and 100', 400);
            }
        }
        if (data.experience_points !== undefined) {
            if (data.experience_points < 0) {
                throw new AppError_1.AppError('experience_points cannot be negative', 400);
            }
        }
    }
}
exports.SkillsService = SkillsService;
//# sourceMappingURL=SkillsService.js.map