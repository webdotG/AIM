"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsController = exports.TagsController = void 0;
const TagsService_1 = require("../services/TagsService");
const pool_1 = require("../../../db/pool");
class TagsController {
    constructor() {
        this.getTags = async (req, res, next) => {
            try {
                const filters = { search: req.query.search };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getTags(req.userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTagById = async (req, res, next) => {
            try {
                const tag = await this.service.getTagById(parseInt(req.params.id), req.userId);
                res.status(200).json({ success: true, data: tag });
            }
            catch (error) {
                next(error);
            }
        };
        this.createTag = async (req, res, next) => {
            try {
                const tag = await this.service.createTag(req.userId, req.body.name);
                res.status(201).json({ success: true, data: tag });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTag = async (req, res, next) => {
            try {
                const tag = await this.service.updateTag(parseInt(req.params.id), req.userId, req.body.name);
                res.status(200).json({ success: true, data: tag });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteTag = async (req, res, next) => {
            try {
                await this.service.deleteTag(parseInt(req.params.id), req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.findOrCreate = async (req, res, next) => {
            try {
                const tag = await this.service.findOrCreate(req.userId, req.body.name);
                res.status(200).json({ success: true, data: tag });
            }
            catch (error) {
                next(error);
            }
        };
        this.getNodesByTag = async (req, res, next) => {
            try {
                const nodes = await this.service.getNodesByTag(parseInt(req.params.id), req.userId);
                res.status(200).json({ success: true, data: nodes });
            }
            catch (error) {
                next(error);
            }
        };
        this.getTagsForNode = async (req, res, next) => {
            try {
                const tags = await this.service.getTagsForNode(req.params.nodeId, req.userId);
                res.status(200).json({ success: true, data: tags });
            }
            catch (error) {
                next(error);
            }
        };
        this.replaceTagsForNode = async (req, res, next) => {
            try {
                const result = await this.service.replaceTagsForNode(req.params.nodeId, req.userId, req.body.tag_ids);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMostUsed = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.service.getMostUsed(req.userId, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUnused = async (req, res, next) => {
            try {
                const result = await this.service.getUnused(req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new TagsService_1.TagsService(pool_1.pool);
    }
}
exports.TagsController = TagsController;
exports.tagsController = new TagsController();
//# sourceMappingURL=TagsController.js.map