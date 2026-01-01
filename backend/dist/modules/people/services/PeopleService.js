"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleService = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class PeopleService {
    constructor(peopleRepository) {
        this.peopleRepository = peopleRepository;
    }
    async getAllPeople(userId, filters = {}) {
        const people = await this.peopleRepository.findByUserId(userId, filters);
        const total = await this.peopleRepository.countByUserId(userId, filters);
        return {
            people,
            pagination: {
                page: filters.page || 1,
                limit: filters.limit || 50,
                total,
                totalPages: Math.ceil(total / (filters.limit || 50))
            }
        };
    }
    async getPersonById(id, userId) {
        const person = await this.peopleRepository.findById(id, userId);
        if (!person) {
            throw new AppError_1.AppError('Person not found', 404);
        }
        return person;
    }
    async createPerson(data, userId) {
        return await this.peopleRepository.create({ ...data, user_id: userId });
    }
    async updatePerson(id, updates, userId) {
        const existing = await this.peopleRepository.findById(id, userId);
        if (!existing) {
            throw new AppError_1.AppError('Person not found', 404);
        }
        return await this.peopleRepository.update(id, updates, userId);
    }
    async deletePerson(id, userId) {
        const existing = await this.peopleRepository.findById(id, userId);
        if (!existing) {
            throw new AppError_1.AppError('Person not found', 404);
        }
        await this.peopleRepository.deleteByUser(id, userId);
        return { success: true, message: 'Person deleted successfully' };
    }
    async getMostMentioned(userId, limit = 10) {
        return await this.peopleRepository.getMostMentioned(userId, limit);
    }
}
exports.PeopleService = PeopleService;
//# sourceMappingURL=PeopleService.js.map