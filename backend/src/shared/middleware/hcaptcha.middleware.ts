import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import logger from '../utils/logger';

interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

export class HCaptchaMiddleware {
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://hcaptcha.com/siteverify';
  private readonly enabled: boolean;

  constructor() {
    this.secretKey = process.env.HCAPTCHA_SECRET_KEY || '';
    this.enabled = process.env.HCAPTCHA_ENABLED !== 'false'; // включено
    
    if (this.enabled && !this.secretKey) {
      logger.warn('HCAPTCHA_SECRET_KEY not set, hCaptcha verification disabled');
      this.enabled = false;
    }
  }

  verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Если hCaptcha отключена (например, для разработки)
    if (!this.enabled) {
      logger.warn('hCaptcha verification skipped (disabled)');
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
      const response = await axios.post<HCaptchaVerifyResponse>(
        this.verifyUrl,
        new URLSearchParams({
          secret: this.secretKey,
          response: hcaptchaToken,
          remoteip: req.ip || req.socket.remoteAddress || '',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 5000, // 5 секунд таймаут
        }
      );

      const { success, 'error-codes': errorCodes } = response.data;

      if (!success) {
        logger.warn('hCaptcha verification failed', {
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
      logger.info('hCaptcha verification successful', {
        ip: req.ip,
        hostname: response.data.hostname,
      });

      next();
    } catch (error: any) {
      logger.error('hCaptcha verification error:', error);

      // При ошибке API - пропускаем запрос (fail-open для доступности)
      // Или можно сделать fail-closed (блокировать)
      if (process.env.HCAPTCHA_FAIL_OPEN === 'true') {
        logger.warn('hCaptcha API error, allowing request (fail-open mode)');
        return next();
      }

      res.status(500).json({
        success: false,
        error: 'Failed to verify hCaptcha',
      });
    }
  };

  // Человекопонятные сообщения об ошибках
  private getErrorMessage(errorCodes?: string[]): string {
    if (!errorCodes || errorCodes.length === 0) {
      return 'Unknown error';
    }

    const errorMessages: Record<string, string> = {
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

// Экспортируем синглтон
export const hcaptchaMiddleware = new HCaptchaMiddleware();