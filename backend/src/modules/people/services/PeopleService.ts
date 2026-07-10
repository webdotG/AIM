import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { PeopleRepository } from '../repositories/PeopleRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Pool } from 'pg';

export class PeopleService {
  private pool: Pool;
  private nodesRepo: NodesRepository;
  private peopleRepo: PeopleRepository;

  constructor(pool: Pool) {
    this.pool = pool;
    this.nodesRepo = new NodesRepository(pool);
    this.peopleRepo = new PeopleRepository(pool);
  }

  async createPerson(userId: number, data: { title?: string; full_name: string; nickname?: string; birth_date?: Date | null; relationship?: string; notes?: string }) {
    if (!data.full_name || data.full_name.trim().length === 0) {
      throw new ValidationError('Full name is required');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const node = await this.nodesRepo.create(userId, 'person', data.title || null);
      if (!node) throw new ValidationError('Failed to create person node');

      const person = await this.peopleRepo.create(node.id, data);
      await client.query('COMMIT');
      return { node, person };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPeople(userId: number, filters: { search?: string; relationship?: string } = {}, page: number = 1, limit: number = 50) {
    return this.peopleRepo.findByUserId(userId, filters, page, limit);
  }

  async getMostMentioned(userId: number, limit: number = 10) {
    return this.peopleRepo.getMostMentioned(userId, limit);
  }

  async getPersonById(nodeId: string, userId: number) {
    const node = await this.nodesRepo.findById(nodeId, userId);
    if (!node) throw new NotFoundError('Person not found');

    const person = await this.peopleRepo.findByNodeId(nodeId);
    if (!person) throw new NotFoundError('Person data not found');
    return { node, person };
  }

  async updatePerson(nodeId: string, userId: number, updates: { title?: string; full_name?: string; nickname?: string | null; birth_date?: Date | null; relationship?: string | null; notes?: string | null }) {
    await this.getPersonById(nodeId, userId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      if (updates.title !== undefined) await this.nodesRepo.updateTitle(nodeId, userId, updates.title);

      const personUpdates = { ...updates };
      delete personUpdates.title;
      if (Object.keys(personUpdates).length > 0) {
        const person = await this.peopleRepo.update(nodeId, personUpdates);
        if (!person) throw new NotFoundError('Person not found');
      }

      await client.query('COMMIT');
      return this.getPersonById(nodeId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deletePerson(nodeId: string, userId: number) {
    await this.getPersonById(nodeId, userId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.peopleRepo.softDelete(nodeId);
      await this.nodesRepo.softDelete(nodeId, userId);
      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPersonContacts(nodeId: string, userId: number) {
    await this.getPersonById(nodeId, userId);
    return this.peopleRepo.getContacts(nodeId, userId);
  }
}