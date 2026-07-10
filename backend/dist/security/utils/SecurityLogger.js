"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityLogger = void 0;
const winston_1 = __importDefault(require("winston"));
class SecurityLogger {
    static init() {
        this.logger = winston_1.default.createLogger({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
            transports: [
                new winston_1.default.transports.Console(),
                ...(process.env.NODE_ENV !== 'test' ? [
                    new winston_1.default.transports.File({ filename: 'logs/security/warn.log', level: 'warn' }),
                    new winston_1.default.transports.File({ filename: 'logs/security/error.log', level: 'error' }),
                ] : []),
            ],
        });
    }
    static setHandler(handler) {
        this.handler = handler;
    }
    static log(entry) {
        if (!this.logger)
            this.init();
        switch (entry.level) {
            case 'critical':
                this.logger.error('[SECURITY CRITICAL]', entry);
                break;
            case 'error':
                this.logger.error('[SECURITY ERROR]', entry);
                break;
            case 'warn':
                this.logger.warn('[SECURITY WARN]', entry);
                break;
            case 'info':
                this.logger.info('[SECURITY INFO]', entry);
                break;
        }
        if (this.handler) {
            this.handler(entry);
        }
    }
}
exports.SecurityLogger = SecurityLogger;
//# sourceMappingURL=SecurityLogger.js.map