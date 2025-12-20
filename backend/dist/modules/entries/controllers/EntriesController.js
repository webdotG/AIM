"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entriesController = exports.EntriesController = void 0;
const EntryService_1 = require("../services/EntryService");
const EntriesRepository_1 = require("../repositories/EntriesRepository");
const pool_1 = require("../../../db/pool");
class EntriesController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    entry_type: req.query.type,
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 50,
                    search: req.query.search,
                    from_date: req.query.from,
                    to_date: req.query.to
                };
                const result = await this.entryService.getAllEntries(userId, filters);
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
                const { id } = req.params;
                const userId = req.userId;
                const entry = await this.entryService.getEntryById(id, userId);
                res.status(200).json({
                    success: true,
                    data: entry
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const entryData = req.body;
                const entry = await this.entryService.createEntry(entryData, userId);
                res.status(201).json({
                    success: true,
                    data: entry
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const updates = req.body;
                const entry = await this.entryService.updateEntry(id, updates, userId);
                res.status(200).json({
                    success: true,
                    data: entry
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const result = await this.entryService.deleteEntry(id, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        const entriesRepository = new EntriesRepository_1.EntriesRepository(pool_1.pool);
        this.entryService = new EntryService_1.EntryService(entriesRepository);
    }
}
exports.EntriesController = EntriesController;
exports.entriesController = new EntriesController();
