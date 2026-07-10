import winston from 'winston';

export type SecurityLevel = 'info' | 'warn' | 'error' | 'critical';

export interface SecurityLogEntry {
  timestamp: string;
  sanitizer: string;
  level: SecurityLevel;
  blocked: boolean;
  input: string;
  output?: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
  httpMethod?: string;
  httpPath?: string;
}

export class SecurityLogger {
  private static logger: winston.Logger;
  private static handler?: (entry: SecurityLogEntry) => void;

  static init() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        ...(process.env.NODE_ENV !== 'test' ? [
          new winston.transports.File({ filename: 'logs/security/warn.log', level: 'warn' }),
          new winston.transports.File({ filename: 'logs/security/error.log', level: 'error' }),
        ] : []),
      ],
    });
  }

  static setHandler(handler: (entry: SecurityLogEntry) => void) {
    this.handler = handler;
  }

  static log(entry: SecurityLogEntry) {
    if (!this.logger) this.init();

    switch (entry.level) {
      case 'critical':
        this.logger.error('[SECURITY CRITICAL]', entry);
        break;
      case 'error':
        this.logger.error('[SECURITY ERROR]', entry);
        break;
      case 'warn':
        this.logger.warn('[SECURITY WARN]', entry);
        break;
      case 'info':
        this.logger.info('[SECURITY INFO]', entry);
        break;
    }

    if (this.handler) {
      this.handler(entry);
    }
  }
}