"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleService = void 0;
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const PeopleRepository_1 = require("../repositories/PeopleRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class PeopleService {
    constructor(pool) {
        this.pool = pool;
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
        this.peopleRepo = new PeopleRepository_1.PeopleRepository(pool);
    }
    async createPerson(userId, data) {
        if (!data.full_name || data.full_name.trim().length === 0) {
            throw new AppError_1.ValidationError('Full name is required');
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const node = await this.nodesRepo.create(userId, 'person', data.title || null);
            if (!node)
                throw new AppError_1.ValidationError('Failed to create person node');
            const person = await this.peopleRepo.create(node.id, data);
            await client.query('COMMIT');
            return { node, person };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getPeople(userId, filters = {}, page = 1, limit = 50) {
        return this.peopleRepo.findByUserId(userId, filters, page, limit);
    }
    async getMostMentioned(userId, limit = 10) {
        return this.peopleRepo.getMostMentioned(userId, limit);
    }
    async getPersonById(nodeId, userId) {
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node)
            throw new AppError_1.NotFoundError('Person not found');
        const person = await this.peopleRepo.findByNodeId(nodeId);
        if (!person)
            throw new AppError_1.NotFoundError('Person data not found');
        return { node, person };
    }
    async updatePerson(nodeId, userId, updates) {
        await this.getPersonById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            if (updates.title !== undefined)
                await this.nodesRepo.updateTitle(nodeId, userId, updates.title);
            const personUpdates = { ...updates };
            delete personUpdates.title;
            if (Object.keys(personUpdates).length > 0) {
                const person = await this.peopleRepo.update(nodeId, personUpdates);
                if (!person)
                    throw new AppError_1.NotFoundError('Person not found');
            }
            await client.query('COMMIT');
            return this.getPersonById(nodeId, userId);
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async deletePerson(nodeId, userId) {
        await this.getPersonById(nodeId, userId);
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await this.peopleRepo.softDelete(nodeId);
            await this.nodesRepo.softDelete(nodeId, userId);
            await client.query('COMMIT');
            return { success: true };
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async getPersonContacts(nodeId, userId) {
        await this.getPersonById(nodeId, userId);
        return this.peopleRepo.getContacts(nodeId, userId);
    }
}
exports.PeopleService = PeopleService;
//# sourceMappingURL=PeopleService.js.map