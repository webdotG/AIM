"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationsController = exports.RelationsController = void 0;
const RelationsService_1 = require("../services/RelationsService");
const RelationsRepository_1 = require("../repositories/RelationsRepository");
const EntriesRepository_1 = require("../../entries/repositories/EntriesRepository");
const pool_1 = require("../../../db/pool");
class RelationsController {
    constructor() {
        // GET /api/v1/relations/entry/:entryId - связи для записи
        this.getForEntry = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const relations = await this.relationsService.getForEntry(entryId, userId);
                res.status(200).json({
                    success: true,
                    data: relations
                });
            }
            catch (error) {
                next(error);
            }
        };
        // POST /api/v1/relations - создать связь
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const relationData = req.body;
                const relation = await this.relationsService.createRelation(relationData, userId);
                res.status(201).json({
                    success: true,
                    data: relation,
                    warning: relation.has_cycle ? 'Cycle detected in the graph' : undefined
                });
            }
            catch (error) {
                next(error);
            }
        };
        // DELETE /api/v1/relations/:id - удалить связь
        this.delete = async (req, res, next) => {
            try {
                const relationId = parseInt(req.params.id);
                const userId = req.userId;
                const result = await this.relationsService.deleteRelation(relationId, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/relations/chain/:entryId - цепочка связей (граф)
        this.getChain = async (req, res, next) => {
            try {
                const entryId = req.params.entryId;
                const userId = req.userId;
                const depth = parseInt(req.query.depth) || 10;
                const direction = req.query.direction || 'both';
                const chain = await this.relationsService.getChain(entryId, userId, depth, direction);
                res.status(200).json({
                    success: true,
                    data: chain
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/relations/types - типы связей
        this.getTypes = async (req, res, next) => {
            try {
                const types = await this.relationsService.getRelationTypes();
                res.status(200).json({
                    success: true,
                    data: types
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/relations/most-connected - самые связанные записи
        this.getMostConnected = async (req, res, next) => {
            try {
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 10;
                const entries = await this.relationsService.getMostConnected(userId, limit);
                res.status(200).json({
                    success: true,
                    data: entries
                });
            }
            catch (error) {
                next(error);
            }
        };
        // GET /api/v1/relations/graph - данные для визуализации графа
        this.getGraph = async (req, res, next) => {
            try {
                const userId = req.userId;
                const entryId = req.query.entryId;
                const graphData = await this.relationsService.getGraphData(userId, entryId);
                res.status(200).json({
                    success: true,
                    data: graphData
                });
            }
            catch (error) {
                next(error);
            }
        };
        const relationsRepository = new RelationsRepository_1.RelationsRepository(pool_1.pool);
        const entriesRepository = new EntriesRepository_1.EntriesRepository(pool_1.pool);
        this.relationsService = new RelationsService_1.RelationsService(relationsRepository, entriesRepository);
    }
}
exports.RelationsController = RelationsController;
exports.relationsController = new RelationsController();
