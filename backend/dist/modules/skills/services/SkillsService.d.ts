import { SkillsRepository } from '../repositories/SkillsRepository';
export declare class SkillsService {
    private skillsRepository;
    constructor(skillsRepository: SkillsRepository);
    getAllSkills(userId: number, filters?: any): Promise<{
        skills: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getSkillById(id: number, userId: number): Promise<any>;
    createSkill(data: any, userId: number): Promise<any>;
    updateSkill(id: number, updates: any, userId: number): Promise<any>;
    deleteSkill(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    addProgress(skillId: number, progressData: any, userId: number): Promise<{
        progress: any;
        skill: any;
        level_up: boolean;
        levels_gained: number;
    }>;
    getProgressHistory(skillId: number, userId: number): Promise<any[]>;
    getCategories(userId: number): Promise<any[]>;
    getTopSkills(userId: number, limit?: number): Promise<any[]>;
    private validateSkillData;
}
//# sourceMappingURL=SkillsService.d.ts.map