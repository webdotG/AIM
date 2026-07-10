"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsService = void 0;
const TagsRepository_1 = require("../repositories/TagsRepository");
const NodesRepository_1 = require("../../graph/repositories/NodesRepository");
const AppError_1 = require("../../../shared/errors/AppError");
class TagsService {
    constructor(pool) {
        this.tagsRepo = new TagsRepository_1.TagsRepository(pool);
        this.nodesRepo = new NodesRepository_1.NodesRepository(pool);
    }
    async getTags(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const tags = await this.tagsRepo.findByUserId(userId, filters, limit, offset);
        return {
            data: tags,
            pagination: { page, limit, total: tags.length, totalPages: Math.ceil(tags.length / limit) },
        };
    }
    async getTagById(tagId, userId) {
        const tag = await this.tagsRepo.findById(tagId, userId);
        if (!tag)
            throw new AppError_1.NotFoundError('Tag not found');
        return tag;
    }
    async createTag(userId, name) {
        if (!name || name.trim().length === 0) {
            throw new AppError_1.ValidationError('Tag name is required');
        }
        const existing = await this.tagsRepo.findByUserId(userId, { search: name });
        for (const t of existing) {
            if (t.name.toLowerCase() === name.trim().toLowerCase()) {
                throw new AppError_1.ValidationError(`Tag "${name}" already exists`);
            }
        }
        return this.tagsRepo.create(userId, name.trim());
    }
    async updateTag(tagId, userId, name) {
        await this.getTagById(tagId, userId);
        const tag = await this.tagsRepo.update(tagId, userId, name.trim());
        if (!tag)
            throw new AppError_1.NotFoundError('Tag not found');
        return tag;
    }
    async deleteTag(tagId, userId) {
        await this.getTagById(tagId, userId);
        const result = await this.tagsRepo.delete(tagId, userId);
        if (!result)
            throw new AppError_1.NotFoundError('Tag not found');
        return { success: true };
    }
    async findOrCreate(userId, name) {
        const tag = await this.tagsRepo.findOrCreate(userId, name.trim());
        return { data: tag };
    }
    async getNodesByTag(tagId, userId) {
        await this.getTagById(tagId, userId);
        return this.tagsRepo.getNodesByTag(tagId, userId);
    }
    async getTagsForNode(nodeId, userId) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        return this.tagsRepo.getTagsForNode(nodeId);
    }
    async replaceTagsForNode(nodeId, userId, tagIds) {
        if (!await this.nodesRepo.belongsToUser(nodeId, userId)) {
            throw new AppError_1.NotFoundError('Node not found');
        }
        for (const tagId of tagIds) {
            await this.getTagById(tagId, userId);
        }
        return this.tagsRepo.replaceTagsForNode(nodeId, tagIds, userId);
    }
    async getMostUsed(userId, limit = 10) {
        const tags = await this.tagsRepo.getMostUsed(userId, limit);
        return {
            data: tags,
            pagination: { page: 1, limit: tags.length, total: tags.length, totalPages: 1 },
        };
    }
    async getUnused(userId) {
        const tags = await this.tagsRepo.getUnused(userId);
        return {
            data: tags,
            pagination: { page: 1, limit: tags.length, total: tags.length, totalPages: 1 },
        };
    }
}
exports.TagsService = TagsService;
//# sourceMappingURL=TagsService.js.map