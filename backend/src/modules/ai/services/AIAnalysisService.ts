import { Pool } from 'pg';
import { BaseRepository } from '../../../shared/repositories/BaseRepository';
import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

interface AIResult {
  model: string | null;
  prompt: string | null;
  result: string;
  metadata: any;
  image_url?: string;
}

export class AIRepository extends BaseRepository {
  constructor(pool: Pool) {
    super(pool);
  }

  async createAnalysis(nodeId: string, analysisType: string, aiModel: string | null, prompt: string | null, result: string, metadata: any) {
    const r = await this.pool.query(
      `INSERT INTO ai_analysis (node_id, analysis_type, ai_model, prompt, result, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nodeId, analysisType, aiModel, prompt, result, metadata ? JSON.stringify(metadata) : null]
    );
    return r.rows[0];
  }

  async getAnalysisByNode(nodeId: string) {
    const r = await this.pool.query(
      'SELECT * FROM ai_analysis WHERE node_id = $1 ORDER BY created_at DESC',
      [nodeId]
    );
    return r.rows;
  }

  async createImage(nodeId: string, imageUrl: string, prompt: string | null, metadata: any, aiModel: string | null) {
    const r = await this.pool.query(
      `INSERT INTO ai_images (node_id, image_url, prompt, metadata, ai_model)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nodeId, imageUrl, prompt, metadata ? JSON.stringify(metadata) : null, aiModel]
    );
    return r.rows[0];
  }

  async getImagesByNode(nodeId: string) {
    const r = await this.pool.query(
      'SELECT * FROM ai_images WHERE node_id = $1 ORDER BY created_at DESC',
      [nodeId]
    );
    return r.rows;
  }
}

export class AIAnalysisService {
  private pool: Pool;
  private aiRepo: AIRepository;
  private nodesRepo: NodesRepository;

  constructor(pool: Pool) {
    this.pool = pool;
    this.aiRepo = new AIRepository(pool);
    this.nodesRepo = new NodesRepository(pool);
  }

  async requestAnalysis(nodeId: string, userId: number, analysisType: string, aiServiceUrl: string) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }

    const node = await this.nodesRepo.findById(nodeId, userId);
    if (!node) throw new NotFoundError('Node not found');

    const content = await this.getNodeContent(nodeId);

    const response = await fetch(`${aiServiceUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_id: nodeId, node_type: node.node_type_code, content, analysis_type: analysisType }),
    });

    if (!response.ok) throw new ValidationError('AI service error');

    const aiResult = await response.json() as AIResult;

    const analysis = await this.aiRepo.createAnalysis(
      nodeId,
      analysisType,
      aiResult.model || null,
      aiResult.prompt || null,
      aiResult.result,
      aiResult.metadata || null
    );

    return analysis;
  }

  async getAnalysis(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    return this.aiRepo.getAnalysisByNode(nodeId);
  }

  async requestImageGeneration(nodeId: string, userId: number, prompt: string | null, aiServiceUrl: string) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }

    const content = prompt || (await this.getNodeContent(nodeId));
    if (!content) throw new ValidationError('Content required for image generation');

    const response = await fetch(`${aiServiceUrl}/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: content }),
    });

    if (!response.ok) throw new ValidationError('AI image generation error');

    const aiResult = await response.json() as AIResult;
    if (!aiResult.image_url) throw new ValidationError('No image_url returned');

    const image = await this.aiRepo.createImage(
      nodeId,
      aiResult.image_url,
      prompt,
      aiResult.metadata || null,
      aiResult.model || null
    );

    return image;
  }

  async getImages(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    return this.aiRepo.getImagesByNode(nodeId);
  }

  private async getNodeContent(nodeId: string): Promise<string> {
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
        } catch { /* ignore */ }
      }

      // Tables with 'description' column
      const descTables = ['plans', 'actions', 'projects'];
      for (const table of descTables) {
        try {
          const result = await client.query(`SELECT description FROM ${table} WHERE node_id = $1`, [nodeId]);
          if (result.rows.length > 0 && result.rows[0].description) {
            return result.rows[0].description;
          }
        } catch { /* ignore */ }
      }

      return '';
    } finally {
      client.release();
    }
  }
}