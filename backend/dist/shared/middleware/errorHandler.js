"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (error, req, res, next) => {
    logger_1.default.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });
    // Zod validation errors
    if (error.name === 'ZodError') {
        res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.issues,
        });
        return;
    }
    // Prisma errors
    if (error.code?.startsWith('P')) {
        // Database errors
        res.status(500).json({
            success: false,
            error: 'Database error',
        });
        return;
    }
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid token',
        });
        return;
    }
    // Default error
    const status = error.status || 500;
    const message = error.message || 'Internal server error';
    res.status(status).json({
        success: false,
        error: message,
    });
};
exports.errorHandler = errorHandler;
