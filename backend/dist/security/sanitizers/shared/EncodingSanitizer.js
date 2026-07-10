"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodingSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
class EncodingSanitizer extends BaseSanitizer_1.BaseSanitizer {
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        const str = input;
        let sanitized = str;
        // Normalize Unicode
        sanitized = sanitized.normalize('NFC');
        // Remove null bytes
        sanitized = sanitized.replace(/\0/g, '');
        // Decode double-encoded sequences
        sanitized = this.decodeDoubleEncoded(sanitized);
        return sanitized;
    }
    shouldSanitize(input) {
        return typeof input === 'string';
    }
    decodeDoubleEncoded(str) {
        const decoded = decodeURIComponent(str);
        if (decoded !== str) {
            return this.decodeDoubleEncoded(decoded);
        }
        return str;
    }
}
exports.EncodingSanitizer = EncodingSanitizer;
//# sourceMappingURL=EncodingSanitizer.js.map