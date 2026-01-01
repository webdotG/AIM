export declare class TestFactories {
    private static get pool();
    /**
     * Создает тестового пользователя
     */
    static createUser(overrides?: {
        login?: string;
        password?: string;
    }): Promise<any>;
    /**
     * Создает circumstance
     */
    static createCircumstance(userId: number, overrides?: {
        weather?: string;
        temperature?: number;
        moon_phase?: string;
        global_event?: string;
        notes?: string;
    }): Promise<any>;
    /**
     * Создает body_state
     */
    static createBodyState(userId: number, overrides?: {
        location_name?: string;
        location_point?: {
            lat: number;
            lng: number;
        };
        health_points?: number;
        energy_points?: number;
        circumstance_id?: number;
    }): Promise<any>;
    /**
     * Создает entry (запись)
     */
    static createEntry(userId: number, overrides?: {
        entry_type?: 'dream' | 'memory' | 'thought' | 'plan';
        content?: string;
        body_state_id?: number;
        circumstance_id?: number;
        deadline?: Date;
        is_completed?: boolean;
    }): Promise<any>;
    static getRandomEmotion(): Promise<any>;
    static addEmotionToEntry(entryId: string, emotionName: string, intensity?: number): Promise<any>;
    /**
     * Создает person
     */
    static createPerson(userId: number, overrides?: {
        name?: string;
        category?: 'family' | 'friends' | 'acquaintances' | 'strangers';
        relationship?: string;
        bio?: string;
    }): Promise<any>;
    /**
     * Связывает entry с person
     */
    static addPersonToEntry(entryId: string, personId: number, role?: string): Promise<any>;
    /**
     * Создает tag
     */
    static createTag(userId: number, name: string): Promise<any>;
    static cleanupTags(userId: number): Promise<void>;
    /**
     * Связывает entry с tag
     */
    static addTagToEntry(entryId: string, tagId: number): Promise<void>;
    /**
     * Создает relation между entries
     */
    static createEntryRelation(fromEntryId: string, toEntryId: string, relationType?: string): Promise<any>;
    /**
     * Создает skill
     */
    static createSkill(userId: number, overrides?: {
        name?: string;
        category?: string;
        current_level?: number;
        experience_points?: number;
    }): Promise<any>;
    /**
     * Добавляет прогресс к skill
     */
    static addSkillProgress(skillId: number, overrides?: {
        entry_id?: string;
        body_state_id?: number;
        experience_gained?: number;
    }): Promise<any>;
    /**
     * Очищает все данные пользователя
     */
    static cleanupUser(userId: number): Promise<void>;
    /**
     * Очищает все тестовые данные
     */
    static cleanupAll(): Promise<void>;
}
//# sourceMappingURL=test-factories.d.ts.map