"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
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
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.errors
        });
    }
};
exports.validate = validate;
