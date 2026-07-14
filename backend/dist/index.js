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
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yaml_1 = __importDefault(require("yaml"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./shared/middleware/errorHandler");
const requestLogger_1 = require("./shared/middleware/requestLogger");
const rateLimiter_middleware_1 = require("./shared/middleware/rateLimiter.middleware");
const sanitizerMiddleware_1 = require("./security/middleware/sanitizerMiddleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
// Swagger — load spec, serve UI at /swagger and raw JSON at /swagger.json
const swaggerPath = path_1.default.join(__dirname, '..', 'swagger.yaml');
const swaggerDocument = yaml_1.default.parse(fs_1.default.readFileSync(swaggerPath, 'utf8'));
app.use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
    customSiteTitle: 'AIM API',
    swaggerOptions: {
        persistAuthorization: true,
        tryItOutEnabled: true,
        filters: true,
    },
}));
app.get('/swagger.json', (_req, res) => {
    res.json(swaggerDocument);
});
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(requestLogger_1.requestLogger);
app.use(rateLimiter_middleware_1.generalLimiter);
// Skip sanitization for health, swagger, favicon
app.use((0, sanitizerMiddleware_1.createSanitizerMiddleware)({
    preset: 'api',
    debug: process.env.NODE_ENV === 'development',
    maxLength: 10000,
    skipPaths: ['/health', '/favicon.ico', '/swagger.json'],
}));
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
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`API: http://localhost:${PORT}/api/v1`);
        console.log(`Swagger UI: http://localhost:${PORT}/swagger`);
        console.log(`Swagger JSON: http://localhost:${PORT}/swagger.json`);
        console.log(`Environment loaded:`, {
            port: PORT,
            nodeEnv: process.env.NODE_ENV,
            pepperLength: process.env.PASSWORD_PEPPER?.length || 0
        });
    });
}
exports.default = app;
//# sourceMappingURL=index.js.map