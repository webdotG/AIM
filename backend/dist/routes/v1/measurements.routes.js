"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MeasurementsController_1 = require("../../modules/measurements/controllers/MeasurementsController");
const auth_middleware_1 = require("../../shared/middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/node/:nodeId', MeasurementsController_1.measurementsController.createMeasurement);
router.get('/node/:nodeId', MeasurementsController_1.measurementsController.getMeasurements);
router.delete('/node/:nodeId', MeasurementsController_1.measurementsController.deleteMeasurements);
exports.default = router;
//# sourceMappingURL=measurements.routes.js.map