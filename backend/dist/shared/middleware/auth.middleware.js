"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtBlacklist_1 = require("../../redis/jwtBlacklist");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }
        const token = authHeader.substring(7);
        try {
            // Verify token signature and expiration
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Extract user ID from token
            const userId = decoded.userId || decoded.user_id || decoded.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Token does not contain user ID'
                });
            }
            // Check if token is blacklisted (revoked)
            const jti = decoded.jti;
            if (jti) {
                const isRevoked = await jwtBlacklist_1.jwtBlacklist.isBlacklisted(jti);
                if (isRevoked) {
                    return res.status(401).json({
                        success: false,
                        error: 'Token has been revoked'
                    });
                }
            }
            // Set user ID on request
            req.userId = userId;
            next();
        }
        catch (verifyError) {
            if (verifyError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Token expired'
                });
            }
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map