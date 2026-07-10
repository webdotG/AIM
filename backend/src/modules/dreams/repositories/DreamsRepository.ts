import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';

export class DreamsRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findByNodeId(nodeId: string): Promise<any | null> {
    const result = await this.pool.query(
      `SELECT * FROM dreams WHERE node_id = $1 AND deleted_at IS NULL`,
      [nodeId]
    );
    return result.rows[0] || null;
  }

  async create(nodeId: string, data: { content: string; dream_date?: Date | null; lucidity?: number | null; vividness?: number | null; nightmare?: boolean; sleep_start?: Date | null; sleep_end?: Date | null }) {
    const result = await this.pool.query(
      `INSERT INTO dreams (node_id, content, dream_date, lucidity, vividness, nightmare, sleep_start, sleep_end)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        nodeId,
        data.content,
        data.dream_date ?? null,
        data.lucidity ?? null,
        data.vividness ?? null,
        data.nightmare ?? false,
        data.sleep_start ?? null,
        data.sleep_end ?? null,
      ]
    );
    return result.rows[0];
  }

  async update(nodeId: string, updates: Partial<{ content: string; dream_date: Date | null; lucidity: number | null; vividness: number | null; nightmare: boolean; sleep_start: Date | null; sleep_end: Date | null }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['content', 'dream_date', 'lucidity', 'vividness', 'nightmare', 'sleep_start', 'sleep_end'];
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
      `UPDATE dreams SET ${fields.join(', ')} WHERE node_id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async softDelete(nodeId: string) {
    const result = await this.pool.query(
      `UPDATE dreams SET deleted_at = NOW() WHERE node_id = $1 AND deleted_at IS NULL RETURNING node_id`,
      [nodeId]
    );
    return result.rows[0] || null;
  }
}