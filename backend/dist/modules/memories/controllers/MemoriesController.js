"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoriesController = exports.MemoriesController = void 0;
const MemoriesService_1 = require("../services/MemoriesService");
const pool_1 = require("../../../db/pool");
class MemoriesController {
    constructor() {
        this.getMemories = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    from_date: req.query.from_date,
                    to_date: req.query.to_date,
                    search: req.query.search,
                };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getMemories(userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMemoryById = async (req, res, next) => {
            try {
                const result = await this.service.getMemoryById(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createMemory = async (req, res, next) => {
            try {
                const result = await this.service.createMemory(req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateMemory = async (req, res, next) => {
            try {
                const result = await this.service.updateMemory(req.params.id, req.userId, req.body);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteMemory = async (req, res, next) => {
            try {
                await this.service.deleteMemory(req.params.id, req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new MemoriesService_1.MemoriesService(pool_1.pool);
    }
}
exports.MemoriesController = MemoriesController;
exports.memoriesController = new MemoriesController();
//# sourceMappingURL=MemoriesController.js.map