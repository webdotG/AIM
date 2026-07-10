"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserInputPreset = createUserInputPreset;
const SanitizerPipeline_1 = require("../pipelines/SanitizerPipeline");
const TrimSanitizer_1 = require("../sanitizers/shared/TrimSanitizer");
const LengthSanitizer_1 = require("../sanitizers/shared/LengthSanitizer");
const EncodingSanitizer_1 = require("../sanitizers/shared/EncodingSanitizer");
const XSSSanitizer_1 = require("../sanitizers/reflected/XSSSanitizer");
const CommandInjectionSanitizer_1 = require("../sanitizers/reflected/CommandInjectionSanitizer");
const PathTraversalSanitizer_1 = require("../sanitizers/reflected/PathTraversalSanitizer");
const CRLFSanitizer_1 = require("../sanitizers/reflected/CRLFSanitizer");
const SQLInjectionSanitizer_1 = require("../sanitizers/search/SQLInjectionSanitizer");
function createUserInputPreset(config = {}) {
    const pipeline = new SanitizerPipeline_1.SanitizerPipeline();
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
//# sourceMappingURL=userInputPreset.js.map