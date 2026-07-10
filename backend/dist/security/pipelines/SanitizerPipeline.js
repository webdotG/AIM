"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizerPipeline = void 0;
const SecurityViolationError_1 = require("../errors/SecurityViolationError");
class SanitizerPipeline {
    constructor() {
        this.sanitizers = [];
    }
    add(sanitizer) {
        this.sanitizers.push(sanitizer);
        return this;
    }
    execute(input) {
        if (this.sanitizers.length === 0) {
            return input;
        }
        // Run synchronously for simple data
        let result = input;
        for (const sanitizer of this.sanitizers) {
            try {
                result = sanitizer.sanitize(result);
            }
            catch (error) {
                if (error instanceof SecurityViolationError_1.SecurityViolationError && error.blocked) {
                    throw error;
                }
                // Continue pipeline even if this sanitizer throws
                console.error(`[SanitizerPipeline] ${sanitizer.name || 'unknown'} error:`, error);
            }
        }
        return result;
    }
    executeDeep(input) {
        if (this.sanitizers.length === 0) {
            return input;
        }
        const clean = (value) => {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    return value.map(item => this.executeDeep(item));
                }
                const cleaned = {};
                for (const [key, val] of Object.entries(value)) {
                    cleaned[key] = this.executeDeep(val);
                }
                return cleaned;
            }
            return this.execute(value);
        };
        return clean(input);
    }
}
exports.SanitizerPipeline = SanitizerPipeline;
//# sourceMappingURL=SanitizerPipeline.js.map