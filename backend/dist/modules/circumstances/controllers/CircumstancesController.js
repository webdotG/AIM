"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.circumstancesController = exports.CircumstancesController = void 0;
const CircumstancesService_1 = require("../services/CircumstancesService");
const CircumstancesRepository_1 = require("../repositories/CircumstancesRepository");
const pool_1 = require("../../../db/pool");
class CircumstancesController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 50,
                    from_date: req.query.from,
                    to_date: req.query.to,
                    weather: req.query.weather,
                    moon_phase: req.query.moon_phase,
                    has_global_event: req.query.has_global_event === 'true' ? true : req.query.has_global_event === 'false' ? false : undefined,
                    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 50)
                };
                const result = await this.circumstancesService.getAllCircumstances(userId, filters);
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
                const circumstance = await this.circumstancesService.getCircumstanceById(id, userId);
                res.status(200).json({
                    success: true,
                    data: circumstance
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const circumstanceData = req.body;
                const circumstance = await this.circumstancesService.createCircumstance(circumstanceData, userId);
                res.status(201).json({
                    success: true,
                    data: circumstance
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
                const circumstance = await this.circumstancesService.updateCircumstance(id, updates, userId);
                res.status(200).json({
                    success: true,
                    data: circumstance
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
                const result = await this.circumstancesService.deleteCircumstance(id, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // Статистика по погоде
        this.getWeatherStats = async (req, res, next) => {
            try {
                const userId = req.userId;
                const fromDate = req.query.from ? new Date(req.query.from) : undefined;
                const toDate = req.query.to ? new Date(req.query.to) : undefined;
                const stats = await this.circumstancesService.getWeatherStats(userId, fromDate, toDate);
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                next(error);
            }
        };
        // Статистика по фазам луны
        this.getMoonPhaseStats = async (req, res, next) => {
            try {
                const userId = req.userId;
                const fromDate = req.query.from ? new Date(req.query.from) : undefined;
                const toDate = req.query.to ? new Date(req.query.to) : undefined;
                const stats = await this.circumstancesService.getMoonPhaseStats(userId, fromDate, toDate);
                res.status(200).json({
                    success: true,
                    data: stats
                });
            }
            catch (error) {
                next(error);
            }
        };
        const circumstancesRepository = new CircumstancesRepository_1.CircumstancesRepository(pool_1.pool);
        this.circumstancesService = new CircumstancesService_1.CircumstancesService(circumstancesRepository);
    }
}
exports.CircumstancesController = CircumstancesController;
exports.circumstancesController = new CircumstancesController();
