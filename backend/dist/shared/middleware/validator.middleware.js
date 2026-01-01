"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.issues // Zod 4
            });
        }
        next(error);
    }
};
exports.validate = validate;
//# sourceMappingURL=validator.middleware.js.map