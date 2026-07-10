"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalysisService = exports.AIRepository = void 0;
const BaseRepository_1 = require("../../../shared/repositories/BaseRepository");
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class AIRepository extends BaseRepository_1.BaseRepository {
    constructor(pool) {
        super(pool);
    }
    async createAnalysis(nodeId, analysisType, aiModel, prompt, result, metadata) {
        const r = await this.pool.query(`INSERT INTO ai_analysis (node_id, analysis_type, ai_model, prompt, result, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [nodeId, analysisType, aiModel, prompt, result, metadata ? JSON.stringify(metadata) : null]);
        return r.rows[0];
    }
    async getAnalysisByNode(nodeId) {
        const r = await this.pool.query('SELECT * FROM ai_analysis WHERE node_id = $1 ORDER BY created_at DESC', [nodeId]);
        return r.rows;
    }
    async createImage(nodeId, imageUrl, prompt, metadata, aiModel) {
        const r = await this.pool.query(`INSERT INTO ai_images (node_id, image_url, prompt, metadata, ai_model)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [nodeId, imageUrl, prompt, metadata ? JSON.stringify(metadata) : null, aiModel]);
        return r.rows[0];
    }
    async getImagesByNode(nodeId) {
        const r = await this.pool.query('SELECT * FROM ai_images WHERE node_id = $1 ORDER BY created_at DESC', [nodeId]);
        return r.rows;
    }
}
exports.AIRepository = AIRepository;
class AIAnalysisService {
    constructor(pool) {
        this.pool = pool;
        this.aiRepo = new AIRepository(pool);
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
    }
    async requestAnalysis(nodeId, userId, analysisType, aiServiceUrl) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        const node = await this.nodesRepo.findById(nodeId, userId);
        if (!node)
            throw new AppError_1.NotFoundError('Node not found');
        const content = await this.getNodeContent(nodeId);
        const response = await fetch(`${aiServiceUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ node_id: nodeId, node_type: node.node_type_code, content, analysis_type: analysisType }),
        });
        if (!response.ok)
            throw new AppError_1.ValidationError('AI service error');
        const aiResult = await response.json();
        const analysis = await this.aiRepo.createAnalysis(nodeId, analysisType, aiResult.model || null, aiResult.prompt || null, aiResult.result, aiResult.metadata || null);
        return analysis;
    }
    async getAnalysis(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return this.aiRepo.getAnalysisByNode(nodeId);
    }
    async requestImageGeneration(nodeId, userId, prompt, aiServiceUrl) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        const content = prompt || (await this.getNodeContent(nodeId));
        if (!content)
            throw new AppError_1.ValidationError('Content required for image generation');
        const response = await fetch(`${aiServiceUrl}/generate-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: content }),
        });
        if (!response.ok)
            throw new AppError_1.ValidationError('AI image generation error');
        const aiResult = await response.json();
        if (!aiResult.image_url)
            throw new AppError_1.ValidationError('No image_url returned');
        const image = await this.aiRepo.createImage(nodeId, aiResult.image_url, prompt, aiResult.metadata || null, aiResult.model || null);
        return image;
    }
    async getImages(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return this.aiRepo.getImagesByNode(nodeId);
    }
    async getNodeContent(nodeId) {
        const client = await this.pool.connect();
        try {
            // Tables with 'content' column
            const contentTables = ['dreams', 'thoughts', 'memories'];
            for (const table of contentTables) {
                try {
                    const result = await client.query(`SELECT content FROM ${table} WHERE node_id = $1`, [nodeId]);
                    if (result.rows.length > 0 && result.rows[0].content) {
                        return result.rows[0].content;
                    }
                }
                catch { /* ignore */ }
            }
            // Tables with 'description' column
            const descTables = ['plans', 'actions', 'projects'];
            for (const table of descTables) {
                try {
                    const result = await client.query(`SELECT description FROM ${table} WHERE node_id = $1`, [nodeId]);
                    if (result.rows.length > 0 && result.rows[0].description) {
                        return result.rows[0].description;
                    }
                }
                catch { /* ignore */ }
            }
            return '';
        }
        finally {
            client.release();
        }
    }
}
exports.AIAnalysisService = AIAnalysisService;
//# sourceMappingURL=AIAnalysisService.js.map