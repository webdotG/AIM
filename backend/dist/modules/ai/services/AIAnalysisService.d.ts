import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
export declare class AIRepository extends BaseRepository {
    constructor(pool: Pool);
    createAnalysis(nodeId: string, analysisType: string, aiModel: string | null, prompt: string | null, result: string, metadata: any): Promise<any>;
    getAnalysisByNode(nodeId: string): Promise<any[]>;
    createImage(nodeId: string, imageUrl: string, prompt: string | null, metadata: any, aiModel: string | null): Promise<any>;
    getImagesByNode(nodeId: string): Promise<any[]>;
}
export declare class AIAnalysisService {
    private pool;
    private aiRepo;
    private nodesRepo;
    constructor(pool: Pool);
    requestAnalysis(nodeId: string, userId: number, analysisType: string, aiServiceUrl: string): Promise<any>;
    getAnalysis(nodeId: string, userId: number): Promise<any[]>;
    requestImageGeneration(nodeId: string, userId: number, prompt: string | null, aiServiceUrl: string): Promise<any>;
    getImages(nodeId: string, userId: number): Promise<any[]>;
    private getNodeContent;
}
//# sourceMappingURL=AIAnalysisService.d.ts.map