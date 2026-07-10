"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSanitizer = void 0;
const SecurityLogger_1 = require("../../utils/SecurityLogger");
class BaseSanitizer {
    constructor(config = {}) {
        this.config = {
            debug: false,
            strict: false,
            ...config,
        };
        this.name = this.constructor.name;
    }
    log(message, level = 'info', input, output) {
        if (!this.config.debug && level === 'info')
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            sanitizer: this.name,
            level,
            blocked: level === 'critical',
            input: (input || message).substring(0, 200),
            output: output ? output.substring(0, 200) : undefined,
        };
        SecurityLogger_1.SecurityLogger.log(entry);
    }
    deepClean(value, sanitizer) {
        if (sanitizer === undefined) {
            sanitizer = (input) => this.sanitize(input);
        }
        if (value === null || value === undefined) {
            return value;
        }
        if (typeof value === 'string') {
            return sanitizer(value);
        }
        if (Array.isArray(value)) {
            return value.map(item => this.deepClean(item, sanitizer));
        }
        if (typeof value === 'object') {
            const cleaned = {};
            for (const [key, val] of Object.entries(value)) {
                cleaned[key] = this.deepClean(val, sanitizer);
            }
            return cleaned;
        }
        return value;
    }
}
exports.BaseSanitizer = BaseSanitizer;
//# sourceMappingURL=BaseSanitizer.js.map