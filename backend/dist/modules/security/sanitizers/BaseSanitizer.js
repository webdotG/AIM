"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSanitizer = void 0;
// src/modules/security/sanitizers/BaseSanitizer.ts
class BaseSanitizer {
    config;
    constructor(config = {}) {
        this.config = config;
    }
    shouldSanitize(input) {
        return input !== null && input !== undefined;
    }
    log(message, level = 'info') {
        if (this.config.debug) {
            console.log(`[${this.constructor.name}] ${level.toUpperCase()}: ${message}`);
        }
    }
}
exports.BaseSanitizer = BaseSanitizer;
