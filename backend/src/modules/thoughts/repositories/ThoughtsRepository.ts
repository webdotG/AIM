import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class ThoughtsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findByNodeId(nodeId: string): Promise<any | null> {
    const result = await this.pool.query(
      `SELECT * FROM thoughts WHERE node_id = $1 AND deleted_at IS NULL`,
      [nodeId]
    );
    return result.rows[0] || null;
  }

  async create(nodeId: string, data: { content: string; importance?: number | null; confidence?: number | null }) {
    const result = await this.pool.query(
      `INSERT INTO thoughts (node_id, content, importance, confidence)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nodeId, data.content, data.importance ?? null, data.confidence ?? null]
    );
    return result.rows[0];
  }

  async update(nodeId: string, updates: Partial<{ content: string; importance: number | null; confidence: number | null }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['content', 'importance', 'confidence'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(nodeId);

    const result = await this.pool.query(
      `UPDATE thoughts SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async softDelete(nodeId: string) {
    const result = await this.pool.query(
      `UPDATE thoughts SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id`,
      [nodeId]
    );
    return result.rows[0] || null;
  }
}