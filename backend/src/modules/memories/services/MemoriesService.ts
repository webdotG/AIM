import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { MemoriesRepository } from '../repositories/MemoriesRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { Pool } from 'pg';

export class MemoriesService {
  private pool: Pool;
  private nodesRepo: NodesRepository;
  private memoriesRepo: MemoriesRepository;

  constructor(pool: Pool) {
    this.pool = pool;
    this.nodesRepo = new NodesRepository(pool);
    this.memoriesRepo = new MemoriesRepository(pool);
  }

  async createMemory(userId: number, data: { title?: string; content: string; event_date?: Date | null; confidence?: number | null }) {
    if (!data.content || data.content.trim().length === 0) {
      throw new ValidationError('Content is required');
    }
    if (data.confidence != null && (data.confidence < 1 || data.confidence > 10)) {
      throw new ValidationError('Confidence must be between 1 and 10');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const node = await this.nodesRepo.create(userId, 'memory', data.title || null);
      if (!node) throw new ValidationError('Failed to create memory node');

      const memory = await this.memoriesRepo.create(node.id, data);
      await client.query('COMMIT');
      return { node, memory };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMemories(userId: number, filters: { from_date?: string; to_date?: string; search?: string } = {}, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT n.*, m.*
      FROM nodes n
      JOIN memories m ON m.node_id = n.id
      WHERE n.user_id = $1 AND n.deleted_at IS NULL AND m.deleted_at IS NULL
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (filters.search) {
      query += ` AND (m.content ILIKE $${paramIndex} OR n.title ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    if (filters.from_date) {
      query += ` AND m.event_date >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }
    if (filters.to_date) {
      query += ` AND m.event_date <= $${paramIndex}`;
      params.push(filters.to_date);
      paramIndex++;
    }

    query += ` ORDER BY m.event_date DESC NULLS LAST, n.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const client = await this.pool.connect();
    const result = await client.query(query, params);
    client.release();

    const items = result.rows.map((row: any) => {
      const { content, event_date, confidence, deleted_at: m_deleted_at, node_id, ...nodeFields } = row;
      return {
        node: { ...nodeFields, content, event_date, confidence },
        memory: { content, event_date, confidence, deleted_at: m_deleted_at, node_id },
      };
    });

    return {
      data: items,
      pagination: { page, limit, total: items.length, totalPages: Math.ceil(items.length / limit) },
    };
  }

  async getMemoryById(nodeId: string, userId: number) {
    const node = await this.nodesRepo.findById(nodeId, userId);
    if (!node) throw new NotFoundError('Memory not found');

    const memory = await this.memoriesRepo.findByNodeId(nodeId);
    if (!memory) throw new NotFoundError('Memory data not found');
    return { node, memory };
  }

  async updateMemory(nodeId: string, userId: number, updates: { title?: string; content?: string; event_date?: Date | null; confidence?: number | null }) {
    await this.getMemoryById(nodeId, userId);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      if (updates.title !== undefined) await this.nodesRepo.updateTitle(nodeId, userId, updates.title);

      const memoryUpdates = { ...updates };
      delete memoryUpdates.title;
      if (Object.keys(memoryUpdates).length > 0) {
        const memory = await this.memoriesRepo.update(nodeId, memoryUpdates);
        if (!memory) throw new NotFoundError('Memory not found');
      }

      await client.query('COMMIT');
      return this.getMemoryById(nodeId, userId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteMemory(nodeId: string, userId: number) {
    await this.getMemoryById(nodeId, userId);
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await this.memoriesRepo.softDelete(nodeId);
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