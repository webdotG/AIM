"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLInjectionSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
const patterns_1 = require("../../utils/patterns");
// SQL Injection patterns (using ATTACK_PATTERNS.SQL_INJECTION from patterns.ts)
const SQL_PATTERNS = patterns_1.ATTACK_PATTERNS.SQL_INJECTION;
class SQLInjectionSanitizer extends BaseSanitizer_1.BaseSanitizer {
    constructor(config = {}) {
        super(config);
        this.whitelist = config.whitelist || [];
    }
    sanitize(input) {
        if (!this.shouldSanitize(input)) {
            return input;
        }
        const str = input;
        // Check if any whitelisted pattern matches
        if (this.whitelist.some(pattern => pattern.test(str))) {
            return input;
        }
        this.log('SQL injection attempt detected', 'warn', str);
        // Escape special SQL characters
        let sanitized = str
            .replace(/['"]/g, '$&$&')
            .replace(/(--\s*|#\s*|;)/g, '')
            .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b/gi, '')
            .replace(/\b(OR|AND)\b\s+\d+\s*=\s*\d+/gi, '')
            .replace(/\b(WAITFOR|BENCHMARK|SLEEP)\b/gi, '')
            .replace(/\binformation_schema\b/gi, '');
        this.log('Input sanitized', 'info', str, sanitized);
        return sanitized;
    }
    shouldSanitize(input) {
        if (typeof input !== 'string')
            return false;
        for (const pattern of SQL_PATTERNS) {
            if (pattern.test(input)) {
                return true;
            }
        }
        return false;
    }
}
exports.SQLInjectionSanitizer = SQLInjectionSanitizer;
//# sourceMappingURL=SQLInjectionSanitizer.js.map