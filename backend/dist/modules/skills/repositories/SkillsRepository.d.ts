import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
interface SkillData {
    user_id: number;
    name: string;
    category?: string | null;
    description?: string | null;
    current_level?: number;
    experience_points?: number;
    icon?: string | null;
    color?: string | null;
}
interface ProgressData {
    skill_id: number;
    entry_id?: string | null;
    body_state_id?: number | null;
    progress_type: string;
    experience_gained: number;
    notes?: string | null;
}
export declare class SkillsRepository extends BaseRepository {
    constructor(pool: Pool);
    findByUserId(userId: number, filters?: any): Promise<any[]>;
    findById(id: number, userId?: number): Promise<any>;
    create(data: SkillData): Promise<any>;
    update(id: number, updates: any, userId: number): Promise<any>;
    deleteByUser(id: number, userId: number): Promise<any>;
    countByUserId(userId: number, filters?: any): Promise<number>;
    addProgress(data: ProgressData): Promise<any>;
    getProgressHistory(skillId: number, limit?: number): Promise<any[]>;
    getTotalExperienceGained(skillId: number): Promise<number>;
    updateExperienceAndLevel(skillId: number, experienceGained: number): Promise<{
        skill: any;
        level_up: boolean;
        levels_gained: number;
    }>;
    getCategories(userId: number): Promise<any[]>;
    getTopSkills(userId: number, limit?: number): Promise<any[]>;
}
export {};
//# sourceMappingURL=SkillsRepository.d.ts.map