"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsController = exports.TagsController = void 0;
const TagsService_1 = require("../services/TagsService");
const TagsRepository_1 = require("../repositories/TagsRepository");
const EntriesRepository_1 = require("../../entries/repositories/EntriesRepository");
const pool_1 = require("../../../db/pool");
class TagsController {
    constructor() {
        // GET /api/v1/tags - все теги
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    search: req.query.search,
                    sort: req.query.sort,
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 100,
                    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 100)
                };
                const result = await this.tagsService.getAllTags(userId, filters);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/tags/:id - тег по ID
        this.getById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const tag = await this.tagsService.getTagById(id, userId);
                res.status(200).json({
                    success: true,
                    data: tag
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/v1/tags - создать тег
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const { name } = req.body;
                const tag = await this.tagsService.createTag(name, userId);
                res.status(201).json({
                    success: true,
                    data: tag
                });
            }
            catch (error) {
                next(error);
            }
        };
        // PUT /api/v1/tags/:id - обновить тег
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const { name } = req.body;
                const tag = await this.tagsService.updateTag(id, name, userId);
                res.status(200).json({
                    success: true,
                    data: tag
                });
            }
            catch (error) {
                next(error);
            }
        };
        // DELETE /api/v1/tags/:id - удалить тег
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const result = await this.tagsService.deleteTag(id, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/tags/entry/:entryId - теги для записи
        this.getForEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const tags = await this.tagsService.getTagsForEntry(entryId, userId);
                res.status(200).json({
                    success: true,
                    data: tags
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/v1/tags/entry/:entryId - привязать теги
        this.attachToEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const { tags } = req.body;
                const result = await this.tagsService.attachTagsToEntry(entryId, tags, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // DELETE /api/v1/tags/entry/:entryId - удалить все теги
        this.detachFromEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const result = await this.tagsService.detachTagsFromEntry(entryId, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/tags/:id/entries - записи по тегу
        this.getEntriesByTag = async (req, res, next) => {
            try {
                const tagId = parseInt(req.params.id);
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 50;
                const entries = await this.tagsService.getEntriesByTag(tagId, userId, limit);
                res.status(200).json({
                    success: true,
                    data: entries
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/tags/most-used - самые используемые
        this.getMostUsed = async (req, res, next) => {
            try {
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 20;
                const tags = await this.tagsService.getMostUsed(userId, limit);
                res.status(200).json({
                    success: true,
                    data: tags
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/tags/unused - неиспользуемые
        this.getUnused = async (req, res, next) => {
            try {
                const userId = req.userId;
                const tags = await this.tagsService.getUnused(userId);
                res.status(200).json({
                    success: true,
                    data: tags
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/v1/tags/find-or-create - создать или найти
        this.findOrCreate = async (req, res, next) => {
            try {
                const userId = req.userId;
                const { name } = req.body;
                const tag = await this.tagsService.findOrCreateTag(name, userId);
                res.status(200).json({
                    success: true,
                    data: tag
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/tags/:id/similar - похожие теги
        this.getSimilar = async (req, res, next) => {
            try {
                const tagId = parseInt(req.params.id);
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 5;
                const tags = await this.tagsService.getSimilarTags(tagId, userId, limit);
                res.status(200).json({
                    success: true,
                    data: tags
                });
            }
            catch (error) {
                next(error);
            }
        };
        const tagsRepository = new TagsRepository_1.TagsRepository(pool_1.pool);
        const entriesRepository = new EntriesRepository_1.EntriesRepository(pool_1.pool);
        this.tagsService = new TagsService_1.TagsService(tagsRepository, entriesRepository);
    }
}
exports.TagsController = TagsController;
exports.tagsController = new TagsController();
