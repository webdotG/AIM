"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSearchPreset = createSearchPreset;
const SanitizerPipeline_1 = require("../pipelines/SanitizerPipeline");
const TrimSanitizer_1 = require("../sanitizers/shared/TrimSanitizer");
const LengthSanitizer_1 = require("../sanitizers/shared/LengthSanitizer");
const EncodingSanitizer_1 = require("../sanitizers/shared/EncodingSanitizer");
const SQLInjectionSanitizer_1 = require("../sanitizers/search/SQLInjectionSanitizer");
function createSearchPreset(config = {}) {
    const pipeline = new SanitizerPipeline_1.SanitizerPipeline();
    pipeline
        .add(new TrimSanitizer_1.TrimSanitizer({ debug: config.debug }))
        .add(new LengthSanitizer_1.LengthSanitizer({ maxLength: config.maxLength ?? 500, debug: config.debug }))
        .add(new EncodingSanitizer_1.EncodingSanitizer({ debug: config.debug }))
        .add(new SQLInjectionSanitizer_1.SQLInjectionSanitizer({ debug: config.debug }));
    return pipeline;
}
//# sourceMappingURL=searchPreset.js.map