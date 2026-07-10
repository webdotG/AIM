"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncSanitizerPipeline = void 0;
const SecurityViolationError_1 = require("../errors/SecurityViolationError");
class AsyncSanitizerPipeline {
    constructor() {
        this.sanitizers = [];
    }
    add(sanitizer) {
        this.sanitizers.push(sanitizer);
        return this;
    }
    async execute(input) {
        if (this.sanitizers.length === 0) {
            return input;
        }
        let result = input;
        for (const sanitizer of this.sanitizers) {
            try {
                result = await Promise.resolve(sanitizer.sanitize(result));
            }
            catch (error) {
                if (error instanceof SecurityViolationError_1.SecurityViolationError && error.blocked) {
                    throw error;
                }
                console.error(`[AsyncSanitizerPipeline] ${sanitizer.name || 'unknown'} error:`, error);
            }
        }
        return result;
    }
    async executeDeep(input) {
        if (this.sanitizers.length === 0) {
            return input;
        }
        const clean = async (value) => {
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    return Promise.all(value.map(item => this.executeDeep(item)));
                }
                const cleaned = {};
                for (const [key, val] of Object.entries(value)) {
                    cleaned[key] = await this.executeDeep(val);
                }
                return cleaned;
            }
            return this.execute(value);
        };
        return clean(input);
    }
}
exports.AsyncSanitizerPipeline = AsyncSanitizerPipeline;
//# sourceMappingURL=AsyncSanitizerPipeline.js.map