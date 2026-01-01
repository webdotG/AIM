import { Pool, QueryResult, QueryResultRow } from 'pg';
export declare abstract class BaseRepository {
    protected pool: Pool;
    constructor(pool: Pool);
    protected query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}
//# sourceMappingURL=BaseRepository.d.ts.map