"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = void 0;
// Простой мок который возвращает функцию verify
exports.verify = jest.fn((req, res, next) => {
    console.log('hCaptcha middleware mocked - skipping verification');
    next();
});
// Если есть default export
exports.default = { verify: exports.verify };
//# sourceMappingURL=hcaptcha.middleware.js.map