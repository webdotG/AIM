"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hcaptchaMiddleware = exports.HCaptchaMiddleware = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
class HCaptchaMiddleware {
    constructor() {
        this.verifyUrl = 'https://hcaptcha.com/siteverify';
        this.verify = async (req, res, next) => {
            // Если hCaptcha отключена (например, для разработки)
            if (!this.enabled) {
                logger_1.default.warn('hCaptcha verification skipped (disabled)');
                return next();
            }
            try {
                const { hcaptchaToken } = req.body;
                // Проверка наличия токена
                if (!hcaptchaToken) {
                    res.status(400).json({
                        success: false,
                        error: 'hCaptcha token is required',
                    });
                    return;
                }
                // Верификация через hCaptcha API
                const response = await axios_1.default.post(this.verifyUrl, new URLSearchParams({
                    secret: this.secretKey,
                    response: hcaptchaToken,
                    remoteip: req.ip || req.socket.remoteAddress || '',
                }), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    timeout: 5000, // 5 секунд таймаут
                });
                const { success, 'error-codes': errorCodes } = response.data;
                if (!success) {
                    logger_1.default.warn('hCaptcha verification failed', {
                        ip: req.ip,
                        errors: errorCodes,
                    });
                    res.status(400).json({
                        success: false,
                        error: 'hCaptcha verification failed',
                        details: this.getErrorMessage(errorCodes),
                    });
                    return;
                }
                // Успех - передаём дальше
                logger_1.default.info('hCaptcha verification successful', {
                    ip: req.ip,
                    hostname: response.data.hostname,
                });
                next();
            }
            catch (error) {
                logger_1.default.error('hCaptcha verification error:', error);
                // При ошибке API - пропускаем запрос (fail-open для доступности)
                // Или можно сделать fail-closed (блокировать)
                if (process.env.HCAPTCHA_FAIL_OPEN === 'true') {
                    logger_1.default.warn('hCaptcha API error, allowing request (fail-open mode)');
                    return next();
                }
                res.status(500).json({
                    success: false,
                    error: 'Failed to verify hCaptcha',
                });
            }
        };
        this.secretKey = process.env.HCAPTCHA_SECRET_KEY || '';
        this.enabled = process.env.HCAPTCHA_ENABLED !== 'false'; // включено
        if (this.enabled && !this.secretKey) {
            logger_1.default.warn('HCAPTCHA_SECRET_KEY not set, hCaptcha verification disabled');
            this.enabled = false;
        }
    }
    // Человекопонятные сообщения об ошибках
    getErrorMessage(errorCodes) {
        if (!errorCodes || errorCodes.length === 0) {
            return 'Unknown error';
        }
        const errorMessages = {
            'missing-input-secret': 'Secret key is missing',
            'invalid-input-secret': 'Secret key is invalid',
            'missing-input-response': 'hCaptcha token is missing',
            'invalid-input-response': 'hCaptcha token is invalid or has expired',
            'bad-request': 'The request is invalid',
            'timeout-or-duplicate': 'Token has already been used or timeout',
            'invalid-or-already-seen-response': 'Token has already been validated',
        };
        return errorMessages[errorCodes[0]] || errorCodes[0];
    }
}
exports.HCaptchaMiddleware = HCaptchaMiddleware;
// Экспортируем синглтон
exports.hcaptchaMiddleware = new HCaptchaMiddleware();
//# sourceMappingURL=hcaptcha.middleware.js.map