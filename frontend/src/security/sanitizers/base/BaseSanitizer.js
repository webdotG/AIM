/**
 * Базовый класс для всех санитайзеров
 */
export default class BaseSanitizer {
  constructor(options = {}) {
    this.options = {
      throwOnError: true,
      logLevel: 'warn',
      ...options
    };
  }

  /**
   * Основной метод санитизации
   * @param {any} input - Входные данные
   * @returns {Promise<any>} - Санитизированные данные
   */
  async sanitize(input) {
    try {
      return await this.process(input);
    } catch (error) {
      if (this.options.throwOnError) {
        throw error;
      }
      console[this.options.logLevel](`[${this.constructor.name}] Error:`, error);
      return this.handleError(error, input);
    }
  }

  /**
   * Абстрактный метод обработки
   * @protected
   */
  async process(input) {
    throw new Error('process() must be implemented in subclass');
  }

  /**
   * Обработка ошибки
   * @protected
   */
  handleError(error, input) {
    return input; // По умолчанию возвращаем оригинал
  }

  /**
   * Логирование
   * @protected
   */
  log(message, level = 'debug') {
    if (this.options.logLevel === 'silent') return;
    console[level](`[${this.constructor.name}] ${message}`);
  }

  /**
   * Проверка на опасные символы
   * @protected
   */
  containsDangerousChars(str) {
    if (typeof str !== 'string') return false;
    
    const dangerousPatterns = [
      /<script\b[^>]*>/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /on\w+\s*=/,
      /\bexec\b/i,
      /\bunion\b/i,
      /\bselect\b/i,
      /\binsert\b/i,
      /\bdelete\b/i,
      /\bupdate\b/i,
      /--/,
      /\/\*.*\*\//,
      /;/
    ];

    return dangerousPatterns.some(pattern => pattern.test(str));
  }
}
