import { TagsRepository } from '../repositories/TagsRepository';
import { NodesRepository } from '../../graph/repositories/NodesRepository';
import { NotFoundError, ConflictError, ValidationError } from '../../../shared/errors/AppError';
import { Pool } from 'pg';

export class TagsService {
  private tagsRepo: TagsRepository;
  private nodesRepo: NodesRepository;

  constructor(pool: Pool) {
    this.tagsRepo = new TagsRepository(pool);
    this.nodesRepo = new NodesRepository(pool);
  }

  async getTags(userId: number, filters: { search?: string } = {}, page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    const tags = await this.tagsRepo.findByUserId(userId, filters, limit, offset);
    return {
      data: tags,
      pagination: { page, limit, total: tags.length, totalPages: Math.ceil(tags.length / limit) },
    };
  }

  async getTagById(tagId: number, userId: number) {
    const tag = await this.tagsRepo.findById(tagId, userId);
    if (!tag) throw new NotFoundError('Tag not found');
    return tag;
  }

  async createTag(userId: number, name: string) {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('Tag name is required');
    }

    const existing = await this.tagsRepo.findByUserId(userId, { search: name });
    for (const t of existing) {
      if (t.name.toLowerCase() === name.trim().toLowerCase()) {
        throw new ValidationError(`Tag "${name}" already exists`);
      }
    }

    return this.tagsRepo.create(userId, name.trim());
  }

  async updateTag(tagId: number, userId: number, name: string) {
    await this.getTagById(tagId, userId);
    const tag = await this.tagsRepo.update(tagId, userId, name.trim());
    if (!tag) throw new NotFoundError('Tag not found');
    return tag;
  }

  async deleteTag(tagId: number, userId: number) {
    await this.getTagById(tagId, userId);
    const result = await this.tagsRepo.delete(tagId, userId);
    if (!result) throw new NotFoundError('Tag not found');
    return { success: true };
  }

  async findOrCreate(userId: number, name: string) {
    const tag = await this.tagsRepo.findOrCreate(userId, name.trim());
    return { data: tag };
  }

  async getNodesByTag(tagId: number, userId: number) {
    await this.getTagById(tagId, userId);
    return this.tagsRepo.getNodesByTag(tagId, userId);
  }

  async getTagsForNode(nodeId: string, userId: number) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    return this.tagsRepo.getTagsForNode(nodeId);
  }

  async replaceTagsForNode(nodeId: string, userId: number, tagIds: number[]) {
    if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
      throw new NotFoundError('Node not found');
    }
    for (const tagId of tagIds) {
      await this.getTagById(tagId, userId);
    }
    return this.tagsRepo.replaceTagsForNode(nodeId, tagIds, userId);
  }

  async getMostUsed(userId: number, limit: number = 10) {
    const tags = await this.tagsRepo.getMostUsed(userId, limit);
    return {
      data: tags,
      pagination: { page: 1, limit: tags.length, total: tags.length, totalPages: 1 },
    };
  }

  async getUnused(userId: number) {
    const tags = await this.tagsRepo.getUnused(userId);
    return {
      data: tags,
      pagination: { page: 1, limit: tags.length, total: tags.length, totalPages: 1 },
    };
  }
}