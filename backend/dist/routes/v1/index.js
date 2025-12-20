"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/v1/index.ts
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const entries_routes_1 = __importDefault(require("./entries.routes"));
const relations_routes_1 = __importDefault(require("./relations.routes"));
const emotions_routes_1 = __importDefault(require("./emotions.routes"));
const people_routes_1 = __importDefault(require("./people.routes"));
const tags_routes_1 = __importDefault(require("./tags.routes"));
const analytics_routes_1 = __importDefault(require("./analytics.routes"));
const body_states_routes_1 = __importDefault(require("./body-states.routes"));
const circumstances_routes_1 = __importDefault(require("./circumstances.routes"));
const skills_routes_1 = __importDefault(require("./skills.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/entries', entries_routes_1.default);
router.use('/relations', relations_routes_1.default);
router.use('/emotions', emotions_routes_1.default);
router.use('/people', people_routes_1.default);
router.use('/tags', tags_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/body-states', body_states_routes_1.default);
router.use('/circumstances', circumstances_routes_1.default);
router.use('/skills', skills_routes_1.default);
exports.default = router;
