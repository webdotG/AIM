import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { EdgeType } from '../../../shared/types';

export class EdgeTypesRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<EdgeType[]> {
    const result = await this.pool.query(
      `SELECT id, code, name, description FROM edge_types ORDER BY id`
    );
    return result.rows;
  }

  async findById(id: number): Promise<EdgeType | null> {
    const result = await this.pool.query(
      `SELECT id, code, name, description FROM edge_types WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByCode(code: string): Promise<EdgeType | null> {
    const result = await this.pool.query(
      `SELECT id, code, name, description FROM edge_types WHERE code = $1`,
      [code]
    );
    return result.rows[0] || null;
  }
}