"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsController = exports.ActionsController = void 0;
const ActionsService_1 = require("../services/ActionsService");
const pool_1 = require("../../../db/pool");
class ActionsController {
    constructor() {
        this.getActions = async (req, res, next) => {
            try {
                const filters = { from_date: req.query.from, to_date: req.query.to, search: req.query.search };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getActions(req.userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getActionById = async (req, res, next) => {
            try {
                const result = await this.service.getActionById(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createAction = async (req, res, next) => {
            try {
                const result = await this.service.createAction(req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateAction = async (req, res, next) => {
            try {
                const result = await this.service.updateAction(req.params.id, req.userId, req.body);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteAction = async (req, res, next) => {
            try {
                await this.service.deleteAction(req.params.id, req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new ActionsService_1.ActionsService(pool_1.pool);
    }
}
exports.ActionsController = ActionsController;
exports.actionsController = new ActionsController();
//# sourceMappingURL=ActionsController.js.map