"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.peopleController = exports.PeopleController = void 0;
const PeopleService_1 = require("../services/PeopleService");
const pool_1 = require("../../../db/pool");
class PeopleController {
    constructor() {
        this.getPeople = async (req, res, next) => {
            try {
                const filters = { search: req.query.search, relationship: req.query.relationship };
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 50;
                const result = await this.service.getPeople(req.userId, filters, page, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMostMentioned = async (req, res, next) => {
            try {
                const limit = parseInt(req.query.limit) || 10;
                const result = await this.service.getMostMentioned(req.userId, limit);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPersonById = async (req, res, next) => {
            try {
                const result = await this.service.getPersonById(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPerson = async (req, res, next) => {
            try {
                const result = await this.service.createPerson(req.userId, req.body);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.updatePerson = async (req, res, next) => {
            try {
                const result = await this.service.updatePerson(req.params.id, req.userId, req.body);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.deletePerson = async (req, res, next) => {
            try {
                await this.service.deletePerson(req.params.id, req.userId);
                res.status(200).json({ success: true });
            }
            catch (error) {
                next(error);
            }
        };
        this.getPersonContacts = async (req, res, next) => {
            try {
                const result = await this.service.getPersonContacts(req.params.id, req.userId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.service = new PeopleService_1.PeopleService(pool_1.pool);
    }
}
exports.PeopleController = PeopleController;
exports.peopleController = new PeopleController();
//# sourceMappingURL=PeopleController.js.map