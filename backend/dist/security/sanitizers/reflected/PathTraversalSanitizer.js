"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathTraversalSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
const patterns_1 = require("../../utils/patterns");
class PathTraversalSanitizer extends BaseSanitizer_1.BaseSanitizer {
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        const str = input;
        let sanitized = str;
        // Remove path traversal sequences
        sanitized = sanitized.replace(/\.\.[\\/]/g, '');
        sanitized = sanitized.replace(/[\\\/]/g, '/');
        sanitized = sanitized.replace(/\.\.\//g, '');
        // Remove URL-encoded patterns
        sanitized = sanitized.replace(/%2e%2e/gi, '');
        sanitized = sanitized.replace(/%252e%252e/gi, '');
        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');
        return sanitized;
    }
    shouldSanitize(input) {
        return typeof input === 'string' && patterns_1.ATTACK_PATTERNS.PATH_TRAVERSAL.some(p => p.test(input));
    }
}
exports.PathTraversalSanitizer = PathTraversalSanitizer;
//# sourceMappingURL=PathTraversalSanitizer.js.map