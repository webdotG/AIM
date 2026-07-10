"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRLFSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
const patterns_1 = require("../../utils/patterns");
class CRLFSanitizer extends BaseSanitizer_1.BaseSanitizer {
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        const str = input;
        return str.replace(/[\r\n]/g, '').replace(/%0[dD]|%0[aA]/g, '');
    }
    shouldSanitize(input) {
        return typeof input === 'string' && patterns_1.ATTACK_PATTERNS.CRLF.some(p => p.test(input));
    }
}
exports.CRLFSanitizer = CRLFSanitizer;
//# sourceMappingURL=CRLFSanitizer.js.map