import { Pool, QueryResult, QueryResultRow } from 'pg';

export abstract class BaseRepository {
  protected pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  protected async query<T extends QueryResultRow = any>(
    text: string, 
    params?: any[]
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
}
