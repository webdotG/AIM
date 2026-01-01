import { EntriesRepository } from '../repositories/EntriesRepository';
import { EntryEmotionsRepository } from '../repositories/EntryEmotionsRepository';
import { EntryTagsRepository } from '../repositories/EntryTagsRepository';
import { EntryPeopleRepository } from '../repositories/EntryPeopleRepository';
export declare class EntryService {
    private entriesRepository;
    private entryEmotionsRepository;
    private entryTagsRepository;
    private entryPeopleRepository;
    constructor(entriesRepository: EntriesRepository, entryEmotionsRepository?: EntryEmotionsRepository, entryTagsRepository?: EntryTagsRepository, entryPeopleRepository?: EntryPeopleRepository);
    getAllEntries(userId: number, filters?: any): Promise<{
        entries: any[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getEntryById(id: string, userId: number): Promise<any>;
    createEntry(entryData: any, userId: number): Promise<any>;
    updateEntry(id: string, updates: any, userId: number): Promise<any>;
    deleteEntry(id: string, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    private validateEntryData;
    addEmotionToEntry(entryId: string, emotionId: number, intensity: number, userId: number): Promise<any>;
    addTagToEntry(entryId: string, tagId: number, userId: number): Promise<any>;
    addPersonToEntry(entryId: string, personId: number, userId: number, role?: string): Promise<any>;
    private checkEmotionExists;
    private checkTagExists;
    private checkPersonExists;
}
//# sourceMappingURL=EntryService.d.ts.map