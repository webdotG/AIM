"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
// Routes
const auth_routes_1 = __importDefault(require("./routes/v1/auth.routes"));
const entries_routes_1 = __importDefault(require("./routes/v1/entries.routes"));
const relations_routes_1 = __importDefault(require("./routes/v1/relations.routes"));
const emotions_routes_1 = __importDefault(require("./routes/v1/emotions.routes"));
const people_routes_1 = __importDefault(require("./routes/v1/people.routes"));
const tags_routes_1 = __importDefault(require("./routes/v1/tags.routes"));
const analytics_routes_1 = __importDefault(require("./routes/v1/analytics.routes"));
// Middleware
const errorHandler_1 = require("./shared/middleware/errorHandler");
const requestLogger_1 = require("./shared/middleware/requestLogger");
const rateLimiter_middleware_1 = require("./shared/middleware/rateLimiter.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Базовые middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(requestLogger_1.requestLogger);
app.use(rateLimiter_middleware_1.generalLimiter);
// API Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/entries', entries_routes_1.default);
app.use('/api/v1/relations', relations_routes_1.default);
app.use('/api/v1/emotions', emotions_routes_1.default);
app.use('/api/v1/people', people_routes_1.default);
app.use('/api/v1/tags', tags_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
