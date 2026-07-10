"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Minimal env setup — runs BEFORE any test imports via setupFiles
const dotenv_1 = __importDefault(require("dotenv"));
process.env.NODE_ENV = 'test';
dotenv_1.default.config({ path: '.env.test' });
//# sourceMappingURL=setup-env.js.map