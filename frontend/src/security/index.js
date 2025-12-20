// Экспорт санитайзеров
export { default as BaseSanitizer } from './sanitizers/base/BaseSanitizer.js';
export { default as HTMLSanitizer } from './sanitizers/shared/HTMLSanitizer.js';
export { default as XSSSanitizer } from './sanitizers/frontend/XSSSanitizer.js';
export { default as TrimSanitizer } from './sanitizers/shared/TrimSanitizer.js';
export { default as LengthSanitizer } from './sanitizers/shared/LengthSanitizer.js';

export { default as URLSanitizer } from './sanitizers/shared/URLSanitizer.js';
export { default as OpenRedirectSanitizer } from './sanitizers/reflected/OpenRedirectSanitizer.js';
export { default as NoSQLInjectionSanitizer } from './sanitizers/search/NoSQLInjectionSanitizer.js';
export { default as SQLInjectionSanitizer } from './sanitizers/search/SQLInjectionSanitizer.js';
export { default as FileUploadSanitizer } from './sanitizers/files/FileUploadSanitizer.js';
export { default as XXESanitizer } from './sanitizers/structured/XXESanitizer.js';
export { default as FormulaInjectionSanitizer } from './sanitizers/files/FormulaInjectionSanitizer.js';
export { default as JWTValidator } from './sanitizers/structured/JWTValidator.js';
export { default as CSRFSanitizer } from './sanitizers/frontend/CSRFSanitizer.js';

// export { default as SanitizerPipeline } from './pipelines/SanitizerPipeline.js';

// Экспорт валидаторов
export { default as SchemaValidator } from './validators/SchemaValidator.js';

// Экспорт утилит
export * from './utils/detectors.js';

// Функции-помощники
export class SecurityHelper {
  /**
   * Создать пайплайн для контента записи
   */
  static async createEntryContentPipeline() {
    const { createUserInputPreset } = await import('./pipelines/presets/userInputPreset.js');
    return createUserInputPreset({
      maxLength: 10000,
      allowedTags: [
        'p', 'b', 'i', 'u', 'em', 'strong', 'br',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote'
      ]
    });
  }
  
  /**
   * Создать пайплайн для пользовательского ввода
   */
  static async createUserInputPipeline() {
    const { createUserInputPreset } = await import('./pipelines/presets/userInputPreset.js');
    return createUserInputPreset();
  }
  
  /**
   * Быстрая санитизация текста
   */
  static async quickSanitize(text) {
    const pipeline = await this.createUserInputPipeline();
    return await pipeline.execute(text);
  }
  
  /**
   * Проверить на атаки
   */
  static detectAttacks(input) {
    const { InputClassifier } = require('./utils/detectors.js');
    return InputClassifier.classify(input);
  }
}
