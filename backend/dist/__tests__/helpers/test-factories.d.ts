export declare class TestFactories {
    static createUser(overrides?: {
        login?: string;
        password?: string;
    }): Promise<any>;
    static createNode(userId: number, nodeTypeCode?: string, title?: string): Promise<any>;
    static createDream(userId: number, overrides?: {
        title?: string;
        content?: string;
        dream_date?: string;
        lucidity?: number;
        vividness?: number;
        nightmare?: boolean;
    }): Promise<any>;
    static createThought(userId: number, overrides?: {
        title?: string;
        content?: string;
        importance?: number;
        confidence?: number;
    }): Promise<any>;
    static createMemory(userId: number, overrides?: {
        title?: string;
        content?: string;
        event_date?: string;
        confidence?: number;
    }): Promise<any>;
    static createPlan(userId: number, overrides?: {
        title?: string;
        description?: string;
        deadline?: string;
        priority?: number;
        completed?: boolean;
    }): Promise<any>;
    static createAction(userId: number, overrides?: {
        title?: string;
        description?: string;
        activity_id?: number;
        started_at?: string;
        finished_at?: string;
    }): Promise<any>;
    static createPerson(userId: number, overrides?: {
        title?: string;
        full_name?: string;
        nickname?: string;
        birth_date?: string;
        relationship?: string;
        notes?: string;
    }): Promise<any>;
    static createEdge(fromNodeId: string, toNodeId: string, edgeTypeCode?: string, confidence?: number, weight?: number): Promise<any>;
    static findEmotion(code: string): Promise<any>;
    static getRandomEmotion(): Promise<any>;
    static addEmotionToNode(nodeId: string, emotionName: string, intensity?: number): Promise<any>;
    static removeEmotionsFromNode(nodeId: string): Promise<void>;
    static createTag(userId: number, name: string): Promise<any>;
    static addTagToNode(nodeId: string, tagId: number): Promise<void>;
    static removeTagsFromNode(nodeId: string): Promise<void>;
    static createMeasurementDefinition(overrides?: {
        code?: string;
        name?: string;
        data_type?: 'integer' | 'decimal' | 'boolean' | 'text';
        default_unit?: string;
    }): Promise<any>;
    static cleanupUser(userId: number): Promise<void>;
    static cleanupNode(nodeId: string): Promise<void>;
}
//# sourceMappingURL=test-factories.d.ts.map