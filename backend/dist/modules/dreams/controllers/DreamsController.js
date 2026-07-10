"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dreamsController = exports.DreamsController = void 0;
const DreamsService_1 = require("../services/DreamsService");
const pool_1 = require("../../../db/pool");
class DreamsController {
    constructor() {
        this.getDreams = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    from_date: req.query.from,
                    to_date: req.query.to,
                    nightmare: req.query.nightmare === 'true',
                };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getDreams(userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getDreamById = async (req, res, next) => {
            try {
                const result = await this.service.getDreamById(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createDream = async (req, res, next) => {
            try {
                const result = await this.service.createDream(req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateDream = async (req, res, next) => {
            try {
                const result = await this.service.updateDream(req.params.id, req.userId, req.body);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteDream = async (req, res, next) => {
            try {
                await this.service.deleteDream(req.params.id, req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new DreamsService_1.DreamsService(pool_1.pool);
    }
}
exports.DreamsController = DreamsController;
exports.dreamsController = new DreamsController();
//# sourceMappingURL=DreamsController.js.map