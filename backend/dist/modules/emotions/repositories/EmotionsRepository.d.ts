import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { Emotion, EmotionCategory } from '../../../shared/types';
export declare class EmotionsRepository extends BaseRepository {
    constructor(pool: Pool);
    findAll(): Promise<Emotion[]>;
    findByCategory(category: EmotionCategory): Promise<Emotion[]>;
    findById(id: number): Promise<Emotion | null>;
}
//# sourceMappingURL=EmotionsRepository.d.ts.map