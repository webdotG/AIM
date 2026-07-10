"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSanitizerMiddleware = exports.createAuthPreset = exports.createApiPreset = exports.createSearchPreset = exports.createUserInputPreset = exports.SQLInjectionSanitizer = exports.PathTraversalSanitizer = exports.CRLFSanitizer = exports.CommandInjectionSanitizer = exports.XSSSanitizer = exports.EncodingSanitizer = exports.LengthSanitizer = exports.TrimSanitizer = exports.AsyncSanitizerPipeline = exports.SanitizerPipeline = exports.ATTACK_PATTERNS = exports.SecurityLogger = exports.SecurityViolationError = exports.BaseSanitizer = void 0;
// Base
var BaseSanitizer_1 = require("./sanitizers/base/BaseSanitizer");
Object.defineProperty(exports, "BaseSanitizer", { enumerable: true, get: function () { return BaseSanitizer_1.BaseSanitizer; } });
// Errors
var SecurityViolationError_1 = require("./errors/SecurityViolationError");
Object.defineProperty(exports, "SecurityViolationError", { enumerable: true, get: function () { return SecurityViolationError_1.SecurityViolationError; } });
// Utilities
var SecurityLogger_1 = require("./utils/SecurityLogger");
Object.defineProperty(exports, "SecurityLogger", { enumerable: true, get: function () { return SecurityLogger_1.SecurityLogger; } });
var patterns_1 = require("./utils/patterns");
Object.defineProperty(exports, "ATTACK_PATTERNS", { enumerable: true, get: function () { return patterns_1.ATTACK_PATTERNS; } });
// Pipelines
var SanitizerPipeline_1 = require("./pipelines/SanitizerPipeline");
Object.defineProperty(exports, "SanitizerPipeline", { enumerable: true, get: function () { return SanitizerPipeline_1.SanitizerPipeline; } });
var AsyncSanitizerPipeline_1 = require("./pipelines/AsyncSanitizerPipeline");
Object.defineProperty(exports, "AsyncSanitizerPipeline", { enumerable: true, get: function () { return AsyncSanitizerPipeline_1.AsyncSanitizerPipeline; } });
// Sanitizers - Shared
var TrimSanitizer_1 = require("./sanitizers/shared/TrimSanitizer");
Object.defineProperty(exports, "TrimSanitizer", { enumerable: true, get: function () { return TrimSanitizer_1.TrimSanitizer; } });
var LengthSanitizer_1 = require("./sanitizers/shared/LengthSanitizer");
Object.defineProperty(exports, "LengthSanitizer", { enumerable: true, get: function () { return LengthSanitizer_1.LengthSanitizer; } });
var EncodingSanitizer_1 = require("./sanitizers/shared/EncodingSanitizer");
Object.defineProperty(exports, "EncodingSanitizer", { enumerable: true, get: function () { return EncodingSanitizer_1.EncodingSanitizer; } });
// Sanitizers - Reflected
var XSSSanitizer_1 = require("./sanitizers/reflected/XSSSanitizer");
Object.defineProperty(exports, "XSSSanitizer", { enumerable: true, get: function () { return XSSSanitizer_1.XSSSanitizer; } });
var CommandInjectionSanitizer_1 = require("./sanitizers/reflected/CommandInjectionSanitizer");
Object.defineProperty(exports, "CommandInjectionSanitizer", { enumerable: true, get: function () { return CommandInjectionSanitizer_1.CommandInjectionSanitizer; } });
var CRLFSanitizer_1 = require("./sanitizers/reflected/CRLFSanitizer");
Object.defineProperty(exports, "CRLFSanitizer", { enumerable: true, get: function () { return CRLFSanitizer_1.CRLFSanitizer; } });
var PathTraversalSanitizer_1 = require("./sanitizers/reflected/PathTraversalSanitizer");
Object.defineProperty(exports, "PathTraversalSanitizer", { enumerable: true, get: function () { return PathTraversalSanitizer_1.PathTraversalSanitizer; } });
// Sanitizers - Search
var SQLInjectionSanitizer_1 = require("./sanitizers/search/SQLInjectionSanitizer");
Object.defineProperty(exports, "SQLInjectionSanitizer", { enumerable: true, get: function () { return SQLInjectionSanitizer_1.SQLInjectionSanitizer; } });
// Presets
var userInputPreset_1 = require("./presets/userInputPreset");
Object.defineProperty(exports, "createUserInputPreset", { enumerable: true, get: function () { return userInputPreset_1.createUserInputPreset; } });
var searchPreset_1 = require("./presets/searchPreset");
Object.defineProperty(exports, "createSearchPreset", { enumerable: true, get: function () { return searchPreset_1.createSearchPreset; } });
var apiPreset_1 = require("./presets/apiPreset");
Object.defineProperty(exports, "createApiPreset", { enumerable: true, get: function () { return apiPreset_1.createApiPreset; } });
var authPreset_1 = require("./presets/authPreset");
Object.defineProperty(exports, "createAuthPreset", { enumerable: true, get: function () { return authPreset_1.createAuthPreset; } });
// Middleware
var sanitizerMiddleware_1 = require("./middleware/sanitizerMiddleware");
Object.defineProperty(exports, "createSanitizerMiddleware", { enumerable: true, get: function () { return sanitizerMiddleware_1.createSanitizerMiddleware; } });
//# sourceMappingURL=index.js.map