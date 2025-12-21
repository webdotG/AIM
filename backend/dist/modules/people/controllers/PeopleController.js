"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peopleController = exports.PeopleController = void 0;
const PeopleService_1 = require("../services/PeopleService");
const PeopleRepository_1 = require("../repositories/PeopleRepository");
const pool_1 = require("../../../db/pool");
class PeopleController {
    constructor() {
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.userId;
                const filters = {
                    category: req.query.category,
                    search: req.query.search,
                    sort: req.query.sort,
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 50,
                    offset: ((parseInt(req.query.page) || 1) - 1) * (parseInt(req.query.limit) || 50)
                };
                const result = await this.peopleService.getAllPeople(userId, filters);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const person = await this.peopleService.getPersonById(id, userId);
                res.status(200).json({ success: true, data: person });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.userId;
                const person = await this.peopleService.createPerson(req.body, userId);
                res.status(201).json({ success: true, data: person });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const person = await this.peopleService.updatePerson(id, req.body, userId);
                res.status(200).json({ success: true, data: person });
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const userId = req.userId;
                const result = await this.peopleService.deletePerson(id, userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMostMentioned = async (req, res, next) => {
            try {
                const userId = req.userId;
                const limit = parseInt(req.query.limit) || 10;
                const people = await this.peopleService.getMostMentioned(userId, limit);
                res.status(200).json({ success: true, data: people });
            }
            catch (error) {
                next(error);
            }
        };
        const peopleRepository = new PeopleRepository_1.PeopleRepository(pool_1.pool);
        this.peopleService = new PeopleService_1.PeopleService(peopleRepository);
    }
}
exports.PeopleController = PeopleController;
exports.peopleController = new PeopleController();
