"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_MEASUREMENT_DATA_TYPES = exports.VALID_EMOTION_CATEGORIES = exports.VALID_EDGE_TYPES = exports.VALID_NODE_TYPES = void 0;
const graph_types_1 = require("./graph.types");
const domain_types_1 = require("./domain.types");
exports.VALID_NODE_TYPES = Object.values(graph_types_1.NodeTypeCode);
exports.VALID_EDGE_TYPES = Object.values(graph_types_1.EdgeTypeCode);
exports.VALID_EMOTION_CATEGORIES = Object.values(domain_types_1.EmotionCategory);
exports.VALID_MEASUREMENT_DATA_TYPES = Object.values(domain_types_1.MeasurementDataType);
//# sourceMappingURL=common.types.js.map