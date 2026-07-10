"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSSSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
const patterns_1 = require("../../utils/patterns");
class XSSSanitizer extends BaseSanitizer_1.BaseSanitizer {
    constructor(config = {}) {
        super(config);
        this.allowedTags = config.allowedTags ?? [];
    }
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        const str = input;
        let sanitized = str;
        for (const pattern of patterns_1.ATTACK_PATTERNS.XSS) {
            if (pattern.test(sanitized)) {
                this.log('XSS pattern detected', 'warn', str, sanitized);
                break;
            }
        }
        // Remove dangerous tags
        sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        sanitized = sanitized.replace(/<[^>]*(on\w+)\s*=/gi, '');
        // Escape remaining HTML
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
        // Restore allowed tags
        for (const tag of this.allowedTags) {
            sanitized = sanitized.replace(`&lt;${tag}&gt;`, `<${tag}>`);
            sanitized = sanitized.replace(`&lt;/${tag}&gt;`, `</${tag}>`);
        }
        return sanitized;
    }
    shouldSanitize(input) {
        return typeof input === 'string' && patterns_1.ATTACK_PATTERNS.XSS.some(p => p.test(input));
    }
}
exports.XSSSanitizer = XSSSanitizer;
//# sourceMappingURL=XSSSanitizer.js.map