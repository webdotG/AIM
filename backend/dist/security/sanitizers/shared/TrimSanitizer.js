"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrimSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
class TrimSanitizer extends BaseSanitizer_1.BaseSanitizer {
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        return input.trim();
    }
    shouldSanitize(input) {
        return typeof input === 'string' && input.trim().length !== input.length;
    }
}
exports.TrimSanitizer = TrimSanitizer;
//# sourceMappingURL=TrimSanitizer.js.map