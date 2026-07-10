"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasurementDataType = exports.EmotionCategory = void 0;
var EmotionCategory;
(function (EmotionCategory) {
    EmotionCategory["POSITIVE"] = "positive";
    EmotionCategory["NEGATIVE"] = "negative";
    EmotionCategory["NEUTRAL"] = "neutral";
})(EmotionCategory || (exports.EmotionCategory = EmotionCategory = {}));
var MeasurementDataType;
(function (MeasurementDataType) {
    MeasurementDataType["INTEGER"] = "integer";
    MeasurementDataType["DECIMAL"] = "decimal";
    MeasurementDataType["BOOLEAN"] = "boolean";
    MeasurementDataType["TEXT"] = "text";
})(MeasurementDataType || (exports.MeasurementDataType = MeasurementDataType = {}));
//# sourceMappingURL=domain.types.js.map