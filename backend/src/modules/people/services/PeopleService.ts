// src/modules/people/services/PeopleService.ts
import { PeopleRepository } from '../repositories/PeopleRepository';
import { AppError } from '../../../shared/errors/AppError';

export class PeopleService {
  constructor(private peopleRepository: PeopleRepository) {}

  async getAllPeople(userId: number, filters: any = {}) {
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

  async getPersonById(id: number, userId: number) {
    const person = await this.peopleRepository.findById(id, userId);
    
    if (!person) {
      throw new AppError('Person not found', 404);
    }

    return person;
  }

  async createPerson(data: any, userId: number) {
    return await this.peopleRepository.create({ ...data, user_id: userId });
  }

  async updatePerson(id: number, updates: any, userId: number) {
    const existing = await this.peopleRepository.findById(id, userId);
    
    if (!existing) {
      throw new AppError('Person not found', 404);
    }

    return await this.peopleRepository.update(id, updates, userId);
  }

  async deletePerson(id: number, userId: number) {
    const existing = await this.peopleRepository.findById(id, userId);
    
    if (!existing) {
      throw new AppError('Person not found', 404);
    }

    await this.peopleRepository.deleteByUser(id, userId);
    return { success: true, message: 'Person deleted successfully' };
  }

  async getMostMentioned(userId: number, limit: number = 10) {
    return await this.peopleRepository.getMostMentioned(userId, limit);
  }
}