"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./shared/middleware/errorHandler");
const requestLogger_1 = require("./shared/middleware/requestLogger");
const rateLimiter_middleware_1 = require("./shared/middleware/rateLimiter.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(requestLogger_1.requestLogger);
app.use(rateLimiter_middleware_1.generalLimiter);
app.use(routes_1.default);
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/v1`);
    console.log(`Environment loaded:`, {
        port: PORT,
        nodeEnv: process.env.NODE_ENV,
        pepperLength: process.env.PASSWORD_PEPPER?.length || 0
    });
});
exports.default = app;
