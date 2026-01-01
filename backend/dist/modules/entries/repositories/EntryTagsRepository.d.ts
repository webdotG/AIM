import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class EntryTagsRepository extends BaseRepository {
    constructor(pool: Pool);
    addTagToEntry(entryId: string, tagId: number): Promise<any>;
    getTagsByEntryId(entryId: string): Promise<any[]>;
    removeTagFromEntry(entryId: string, tagId: number): Promise<any>;
}
//# sourceMappingURL=EntryTagsRepository.d.ts.map