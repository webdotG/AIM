import { Pool } from 'pg';
export declare class PeopleService {
    private pool;
    private nodesRepo;
    private peopleRepo;
    constructor(pool: Pool);
    createPerson(userId: number, data: {
        title?: string;
        full_name: string;
        nickname?: string;
        birth_date?: Date | null;
        relationship?: string;
        notes?: string;
    }): Promise<{
        node: any;
        person: any;
    }>;
    getPeople(userId: number, filters?: {
        search?: string;
        relationship?: string;
    }, page?: number, limit?: number): Promise<any[]>;
    getMostMentioned(userId: number, limit?: number): Promise<any[]>;
    getPersonById(nodeId: string, userId: number): Promise<{
        node: any;
        person: any;
    }>;
    updatePerson(nodeId: string, userId: number, updates: {
        title?: string;
        full_name?: string;
        nickname?: string | null;
        birth_date?: Date | null;
        relationship?: string | null;
        notes?: string | null;
    }): Promise<{
        node: any;
        person: any;
    }>;
    deletePerson(nodeId: string, userId: number): Promise<{
        success: boolean;
    }>;
    getPersonContacts(nodeId: string, userId: number): Promise<any[]>;
}
//# sourceMappingURL=PeopleService.d.ts.map