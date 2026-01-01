import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class EntryPeopleRepository extends BaseRepository {
    constructor(pool: Pool);
    addPersonToEntry(entryId: string, personId: number, role?: string, notes?: string): Promise<any>;
    getPeopleByEntryId(entryId: string): Promise<any[]>;
    removePersonFromEntry(entryId: string, personId: number): Promise<any>;
}
//# sourceMappingURL=EntryPeopleRepository.d.ts.map