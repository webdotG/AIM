"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LengthSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
const SecurityViolationError_1 = require("../../errors/SecurityViolationError");
class LengthSanitizer extends BaseSanitizer_1.BaseSanitizer {
    constructor(config = {}) {
        super(config);
        this.maxLength = config.maxLength ?? 10000;
        this.minLength = config.minLength ?? 0;
    }
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        const str = input;
        if (str.length > this.maxLength) {
            this.log(`Length ${str.length} exceeds max ${this.maxLength}`, 'warn', str);
            return str.substring(0, this.maxLength);
        }
        if (str.length < this.minLength) {
            if (this.config.strict) {
                throw new SecurityViolationError_1.SecurityViolationError(this.config.errorMessage || `Length ${str.length} is below minimum ${this.minLength}`, this.name, 'critical', str);
            }
            this.log(`Length ${str.length} is below minimum ${this.minLength}`, 'warn', str);
            return input;
        }
        return input;
    }
    shouldSanitize(input) {
        return typeof input === 'string';
    }
}
exports.LengthSanitizer = LengthSanitizer;
//# sourceMappingURL=LengthSanitizer.js.map