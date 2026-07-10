"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.thoughtsController = exports.ThoughtsController = void 0;
const ThoughtsService_1 = require("../services/ThoughtsService");
const pool_1 = require("../../../db/pool");
class ThoughtsController {
    constructor() {
        this.getThoughts = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    from_date: req.query.from,
                    to_date: req.query.to,
                    search: req.query.search,
                };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getThoughts(userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getThoughtById = async (req, res, next) => {
            try {
                const result = await this.service.getThoughtById(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createThought = async (req, res, next) => {
            try {
                const result = await this.service.createThought(req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateThought = async (req, res, next) => {
            try {
                const result = await this.service.updateThought(req.params.id, req.userId, req.body);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteThought = async (req, res, next) => {
            try {
                await this.service.deleteThought(req.params.id, req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new ThoughtsService_1.ThoughtsService(pool_1.pool);
    }
}
exports.ThoughtsController = ThoughtsController;
exports.thoughtsController = new ThoughtsController();
//# sourceMappingURL=ThoughtsController.js.map