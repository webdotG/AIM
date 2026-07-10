import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class PlansRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findByNodeId(nodeId: string): Promise<any | null> {
    const result = await this.pool.query(
      `SELECT * FROM plans WHERE node_id = $1 AND deleted_at IS NULL`,
      [nodeId]
    );
    return result.rows[0] || null;
  }

  async create(nodeId: string, data: { description: string; deadline?: Date | null; priority?: number | null; completed?: boolean; completed_at?: Date | null }) {
    const result = await this.pool.query(
      `INSERT INTO plans (node_id, description, deadline, priority, completed, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        nodeId,
        data.description,
        data.deadline || null,
        data.priority ?? null,
        data.completed || false,
        data.completed_at || null,
      ]
    );
    return result.rows[0];
  }

  async update(nodeId: string, updates: Partial<{ description: string; deadline: Date | null; priority: number | null; completed: boolean; completed_at: Date | null }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['description', 'deadline', 'priority', 'completed', 'completed_at'];
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
      `UPDATE plans SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async softDelete(nodeId: string) {
    const result = await this.pool.query(
      `UPDATE plans SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id`,
      [nodeId]
    );
    return result.rows[0] || null;
  }
}