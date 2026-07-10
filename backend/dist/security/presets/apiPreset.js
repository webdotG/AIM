"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiPreset = createApiPreset;
const AsyncSanitizerPipeline_1 = require("../pipelines/AsyncSanitizerPipeline");
const TrimSanitizer_1 = require("../sanitizers/shared/TrimSanitizer");
const LengthSanitizer_1 = require("../sanitizers/shared/LengthSanitizer");
const EncodingSanitizer_1 = require("../sanitizers/shared/EncodingSanitizer");
const XSSSanitizer_1 = require("../sanitizers/reflected/XSSSanitizer");
const SQLInjectionSanitizer_1 = require("../sanitizers/search/SQLInjectionSanitizer");
const CommandInjectionSanitizer_1 = require("../sanitizers/reflected/CommandInjectionSanitizer");
const PathTraversalSanitizer_1 = require("../sanitizers/reflected/PathTraversalSanitizer");
const CRLFSanitizer_1 = require("../sanitizers/reflected/CRLFSanitizer");
function createApiPreset(config = {}) {
    const pipeline = new AsyncSanitizerPipeline_1.AsyncSanitizerPipeline();
    pipeline
        .add(new TrimSanitizer_1.TrimSanitizer({ debug: config.debug }))
        .add(new LengthSanitizer_1.LengthSanitizer({ maxLength: config.maxLength, debug: config.debug, strict: config.strict }))
        .add(new EncodingSanitizer_1.EncodingSanitizer({ debug: config.debug }))
        .add(new SQLInjectionSanitizer_1.SQLInjectionSanitizer({ debug: config.debug }))
        .add(new XSSSanitizer_1.XSSSanitizer({ allowedTags: config.allowedTags, debug: config.debug, strict: config.strict }))
        .add(new CommandInjectionSanitizer_1.CommandInjectionSanitizer({ debug: config.debug }))
        .add(new PathTraversalSanitizer_1.PathTraversalSanitizer({ debug: config.debug }))
        .add(new CRLFSanitizer_1.CRLFSanitizer({ debug: config.debug }));
    return pipeline;
}
//# sourceMappingURL=apiPreset.js.map