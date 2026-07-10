import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { ActionsRepository } from '../repositories/ActionsRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Pool } from 'pg';

export class ActionsService {
  private pool: Pool;
  private nodesRepo: NodesRepository;
  private actionsRepo: ActionsRepository;

  constructor(pool: Pool) {
    this.pool = pool;
    this.nodesRepo = new NodesRepository(pool);
    this.actionsRepo = new ActionsRepository(pool);
  }

  async createAction(userId: number, data: { title?: string; description?: string; activity_id?: number | null; started_at?: Date | null; finished_at?: Date | null }) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const node = await this.nodesRepo.create(userId, 'action', data.title || null);
      if (!node) throw new ValidationError('Failed to create action node');

      const action = await this.actionsRepo.create(node.id, data);
      await client.query('COMMIT');
      return { node, action };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getActions(userId: number, filters: { from_date?: string; to_date?: string; search?: string } = {}, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT n.*, a.*
      FROM nodes n
      JOIN actions a ON a.node_id = n.id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND a.deleted_at IS NULL
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.search) {
      query += ` AND (a.description ILIKE $${paramIndex} OR n.title ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    if (filters.from_date) {
      query += ` AND a.started_at >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }
    if (filters.to_date) {
      query += ` AND a.started_at <= $${paramIndex}`;
      params.push(filters.to_date);
      paramIndex++;
    }

    query += ` ORDER BY a.started_at DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const client = await this.pool.connect();
    const result = await client.query(query, params);
    client.release();

    return {
      data: result.rows,
      pagination: { page, limit, total: result.rows.length, totalPages: Math.ceil(result.rows.length / limit) },
    };
  }

  async getActionById(nodeId: string, userId: number) {
    const node = await this.nodesRepo.findById(nodeId, userId);
    if (!node) throw new NotFoundError('Action not found');

    const action = await this.actionsRepo.findByNodeId(nodeId);
    if (!action) throw new NotFoundError('Action data not found');
    return { node, action };
  }

  async updateAction(nodeId: string, userId: number, updates: any) {
    await this.getActionById(nodeId, userId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      if (updates.title !== undefined) await this.nodesRepo.updateTitle(nodeId, userId, updates.title);

      const actionUpdates = { ...updates };
      delete actionUpdates.title;
      if (Object.keys(actionUpdates).length > 0) {
        const action = await this.actionsRepo.update(nodeId, actionUpdates);
        if (!action) throw new NotFoundError('Action not found');
      }

      await client.query('COMMIT');
      return this.getActionById(nodeId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteAction(nodeId: string, userId: number) {
    await this.getActionById(nodeId, userId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.actionsRepo.softDelete(nodeId);
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
}