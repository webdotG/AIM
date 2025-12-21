"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyStatesController = exports.BodyStatesController = void 0;
const BodyStatesService_1 = require("../services/BodyStatesService");
const BodyStatesRepository_1 = require("../repositories/BodyStatesRepository");
const pool_1 = require("../../../db/pool");
class BodyStatesController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 50,
                    from_date: req.query.from,
                    to_date: req.query.to,
                    has_location: req.query.has_location === 'true' ? true : req.query.has_location === 'false' ? false : undefined,
                    circumstance_id: req.query.circumstance_id ? parseInt(req.query.circumstance_id) : undefined,
                    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 50)
                };
                const result = await this.bodyStatesService.getAllBodyStates(userId, filters);
                res.status(200).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const bodyState = await this.bodyStatesService.getBodyStateById(id, userId);
                res.status(200).json({
                    success: true,
                    data: bodyState
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const bodyStateData = req.body;
                const bodyState = await this.bodyStatesService.createBodyState(bodyStateData, userId);
                res.status(201).json({
                    success: true,
                    data: bodyState
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const updates = req.body;
                const bodyState = await this.bodyStatesService.updateBodyState(id, updates, userId);
                res.status(200).json({
                    success: true,
                    data: bodyState
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const result = await this.bodyStatesService.deleteBodyState(id, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        const bodyStatesRepository = new BodyStatesRepository_1.BodyStatesRepository(pool_1.pool);
        this.bodyStatesService = new BodyStatesService_1.BodyStatesService(bodyStatesRepository);
    }
}
exports.BodyStatesController = BodyStatesController;
exports.bodyStatesController = new BodyStatesController();
