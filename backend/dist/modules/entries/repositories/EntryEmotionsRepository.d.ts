import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class EntryEmotionsRepository extends BaseRepository {
    constructor(pool: Pool);
    addEmotionToEntry(entryId: string, emotionId: number, intensity: number): Promise<any>;
    getEmotionsByEntryId(entryId: string): Promise<any[]>;
    removeEmotionFromEntry(entryId: string, emotionId: number): Promise<any>;
}
//# sourceMappingURL=EntryEmotionsRepository.d.ts.map