"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSanitizerMiddleware = createSanitizerMiddleware;
const SecurityViolationError_1 = require("../errors/SecurityViolationError");
const userInputPreset_1 = require("../presets/userInputPreset");
const apiPreset_1 = require("../presets/apiPreset");
const searchPreset_1 = require("../presets/searchPreset");
const authPreset_1 = require("../presets/authPreset");
function createSanitizerMiddleware(options = {}) {
    const preset = options.preset || 'api';
    const presetConfig = {
        debug: options.debug ?? false,
        allowedTags: options.allowedTags || [],
        maxLength: options.maxLength || 10000,
        ...options.presetConfig,
    };
    let pipeline;
    switch (preset) {
        case 'userInput':
            pipeline = (0, userInputPreset_1.createUserInputPreset)(presetConfig);
            break;
        case 'search':
            pipeline = (0, searchPreset_1.createSearchPreset)(presetConfig);
            break;
        case 'auth':
            pipeline = (0, authPreset_1.createAuthPreset)(presetConfig);
            break;
        case 'api':
        default:
            pipeline = (0, apiPreset_1.createApiPreset)(presetConfig);
            break;
    }
    return async (req, res, next) => {
        try {
            // Skip paths that don't need sanitization
            if (options.skipPaths?.includes(req.path)) {
                return next();
            }
            // Sanitize body
            if (req.body) {
                req.body = (await pipeline.executeDeep(req.body));
            }
            // Sanitize query params
            if (req.query) {
                req.query = (await pipeline.executeDeep(req.query));
            }
            // Sanitize params
            if (req.params) {
                req.params = (await pipeline.executeDeep(req.params));
            }
            // Sanitize headers if needed
            if (req.headers) {
                for (const [key, value] of Object.entries(req.headers)) {
                    if (typeof value === 'string') {
                        req.headers[key] = (await pipeline.execute(value));
                    }
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof SecurityViolationError_1.SecurityViolationError && error.blocked) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid input detected',
                    detail: options.debug ? error.message : undefined,
                });
            }
            next(error);
        }
    };
}
//# sourceMappingURL=sanitizerMiddleware.js.map