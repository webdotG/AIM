import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { NodeType } from '../../../shared/types';

export class NodeTypesRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async findAll(): Promise<NodeType[]> {
    const result = await this.pool.query(
      `SELECT id, code, name, description FROM node_types ORDER BY id`
    );
    return result.rows;
  }

  async findById(id: number): Promise<NodeType | null> {
    const result = await this.pool.query(
      `SELECT id, code, name, description FROM node_types WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByCode(code: string): Promise<NodeType | null> {
    const result = await this.pool.query(
      `SELECT id, code, name, description FROM node_types WHERE code = $1`,
      [code]
    );
    return result.rows[0] || null;
  }
}