"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSSSanitizer = void 0;
// src/modules/security/sanitizers/XSSSanitizer.ts
const BaseSanitizer_1 = require("./BaseSanitizer");
class XSSSanitizer extends BaseSanitizer_1.BaseSanitizer {
    sanitize(input) {
        if (typeof input !== 'string') {
            return input;
        }
        // Базовая защита от XSS
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}
exports.XSSSanitizer = XSSSanitizer;
