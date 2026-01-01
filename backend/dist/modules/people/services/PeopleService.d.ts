import { PeopleRepository } from '../repositories/PeopleRepository';
export declare class PeopleService {
    private peopleRepository;
    constructor(peopleRepository: PeopleRepository);
    getAllPeople(userId: number, filters?: any): Promise<{
        people: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getPersonById(id: number, userId: number): Promise<any>;
    createPerson(data: any, userId: number): Promise<any>;
    updatePerson(id: number, updates: any, userId: number): Promise<any>;
    deletePerson(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    getMostMentioned(userId: number, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=PeopleService.d.ts.map