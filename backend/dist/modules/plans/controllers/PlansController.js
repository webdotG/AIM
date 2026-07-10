"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plansController = exports.PlansController = void 0;
const PlansService_1 = require("../services/PlansService");
const pool_1 = require("../../../db/pool");
class PlansController {
    constructor() {
        this.getPlans = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    completed: req.query.completed ? req.query.completed === 'true' : undefined,
                    overdue: req.query.overdue === 'true',
                    from_date: req.query.from,
                    to_date: req.query.to,
                    search: req.query.search,
                };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getPlans(userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPlanById = async (req, res, next) => {
            try {
                const result = await this.service.getPlanById(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPlan = async (req, res, next) => {
            try {
                const result = await this.service.createPlan(req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePlan = async (req, res, next) => {
            try {
                const result = await this.service.updatePlan(req.params.id, req.userId, req.body);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePlan = async (req, res, next) => {
            try {
                await this.service.deletePlan(req.params.id, req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new PlansService_1.PlansService(pool_1.pool);
    }
}
exports.PlansController = PlansController;
exports.plansController = new PlansController();
//# sourceMappingURL=PlansController.js.map