"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityViolationError = void 0;
class SecurityViolationError extends Error {
    constructor(message, sanitizer, level = 'critical', input = '') {
        super(message);
        this.name = 'SecurityViolationError';
        this.sanitizer = sanitizer;
        this.level = level;
        this.input = input;
        this.blocked = level === 'critical';
    }
}
exports.SecurityViolationError = SecurityViolationError;
//# sourceMappingURL=SecurityViolationError.js.map