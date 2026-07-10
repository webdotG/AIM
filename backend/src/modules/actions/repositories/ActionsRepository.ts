import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class ActionsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findByNodeId(nodeId: string) {
    const result = await this.pool.query(
      'SELECT * FROM actions WHERE node_id = $1 AND deleted_at IS NULL',
      [nodeId]
    );
    return result.rows[0] || null;
  }

  async create(nodeId: string, data: { description?: string; activity_id?: number | null; started_at?: Date | null; finished_at?: Date | null }) {
    const result = await this.pool.query(
      `INSERT INTO actions (node_id, activity_id, started_at, finished_at, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nodeId, data.activity_id || null, data.started_at || new Date(), data.finished_at || null, data.description || null]
    );
    return result.rows[0];
  }

  async update(nodeId: string, updates: Partial<{ description: string; activity_id: number | null; started_at: Date | null; finished_at: Date | null }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['description', 'activity_id', 'started_at', 'finished_at'];
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) throw new Error('No valid fields to update');
    values.push(nodeId);

    const result = await this.pool.query(
      `UPDATE actions SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async softDelete(nodeId: string) {
    const result = await this.pool.query(
      'UPDATE actions SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id',
      [nodeId]
    );
    return result.rows[0] || null;
  }
}