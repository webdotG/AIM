"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandInjectionSanitizer = void 0;
const BaseSanitizer_1 = require("../base/BaseSanitizer");
const patterns_1 = require("../../utils/patterns");
class CommandInjectionSanitizer extends BaseSanitizer_1.BaseSanitizer {
    sanitize(input) {
        if (!this.shouldSanitize(input))
            return input;
        const str = input;
        let sanitized = str;
        // Remove shell metacharacters
        sanitized = sanitized.replace(/[;|&$`\\!<>{}()]/g, '');
        // Remove command patterns
        for (const pattern of patterns_1.ATTACK_PATTERNS.COMMAND_INJECTION) {
            if (pattern.test(sanitized)) {
                this.log('Command injection pattern detected', 'error', str);
            }
        }
        return sanitized;
    }
    shouldSanitize(input) {
        return typeof input === 'string' && patterns_1.ATTACK_PATTERNS.COMMAND_INJECTION.some(p => p.test(input));
    }
}
exports.CommandInjectionSanitizer = CommandInjectionSanitizer;
//# sourceMappingURL=CommandInjectionSanitizer.js.map