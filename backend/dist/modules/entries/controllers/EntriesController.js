"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entriesController = exports.EntriesController = void 0;
const EntryService_1 = require("../services/EntryService");
const EntriesRepository_1 = require("../repositories/EntriesRepository");
const EntryEmotionsRepository_1 = require("../repositories/EntryEmotionsRepository");
const EntryTagsRepository_1 = require("../repositories/EntryTagsRepository");
const EntryPeopleRepository_1 = require("../repositories/EntryPeopleRepository");
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
                    to_date: req.query.to,
                    body_state_id: req.query.body_state_id ? parseInt(req.query.body_state_id) : undefined,
                    circumstance_id: req.query.circumstance_id ? parseInt(req.query.circumstance_id) : undefined,
                    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 50)
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
                // console.log('=== IN CREATE CONTROLLER ===');
                // console.log('Controller req.userId:', req.userId);
                // console.log('Controller headers:', req.headers);
                // console.log('Extracted userId:', userId, 'type:', typeof userId);
                // console.log('Entry data:', entryData);
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
                res.status(204).end();
            }
            catch (error) {
                next(error);
            }
        };
        // Добавьте эти методы для relationships:
        this.addEmotion = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const { emotion_id, intensity } = req.body;
                const result = await this.entryService.addEmotionToEntry(id, emotion_id, intensity, userId);
                res.status(201).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.addTag = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const { tag_id } = req.body;
                const result = await this.entryService.addTagToEntry(id, tag_id, userId);
                res.status(201).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.addPerson = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.userId;
                const { person_id, role } = req.body;
                const result = await this.entryService.addPersonToEntry(id, person_id, userId, role);
                res.status(201).json({
                    success: true,
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        };
        const entriesRepository = new EntriesRepository_1.EntriesRepository(pool_1.pool);
        const entryEmotionsRepository = new EntryEmotionsRepository_1.EntryEmotionsRepository(pool_1.pool);
        const entryTagsRepository = new EntryTagsRepository_1.EntryTagsRepository(pool_1.pool);
        const entryPeopleRepository = new EntryPeopleRepository_1.EntryPeopleRepository(pool_1.pool);
        this.entryService = new EntryService_1.EntryService(entriesRepository, entryEmotionsRepository, entryTagsRepository, entryPeopleRepository);
    }
}
exports.EntriesController = EntriesController;
exports.entriesController = new EntriesController();
//# sourceMappingURL=EntriesController.js.map