export default class SanitizerPipeline {
  constructor(name = 'default') {
    this.name = name;
    this.stages = [];
    this.context = {};
  }

  addStage(sanitizer, stageName = '') {
    this.stages.push({
      name: stageName || sanitizer.constructor.name,
      sanitizer
    });
    return this;
  }

  async execute(input, context = {}) {
    this.context = { ...this.context, ...context };
    let result = input;

    for (const stage of this.stages) {
      try {
        const startTime = performance.now();
        result = await stage.sanitizer.sanitize(result);
        const endTime = performance.now();

        this.logStage(stage.name, startTime, endTime, result);
      } catch (error) {
        console.error(`[SanitizerPipeline] Stage ${stage.name} failed:`, error);
        throw error;
      }
    }

    this.context = {};
    return result;
  }

  logStage(stageName, startTime, endTime, result) {
    const duration = endTime - startTime;
    if (duration > 100) {
      console.warn(`[SanitizerPipeline] Stage ${stageName} took ${duration}ms`);
    }
  }

  static createTextPreset() {
    const HTMLSanitizer = require('../sanitizers/shared/HTMLSanitizer.js').default;
    const XSSSanitizer = require('../sanitizers/frontend/XSSSanitizer.js').default;
    const TrimSanitizer = require('../sanitizers/shared/TrimSanitizer.js').default;
    
    const pipeline = new SanitizerPipeline('text-preset');
    pipeline
      .addStage(new HTMLSanitizer(), 'html-cleanup')
      .addStage(new XSSSanitizer(), 'xss-protection')
      .addStage(new TrimSanitizer(), 'trim-spaces');
    return pipeline;
  }

  static createUserInputPreset() {
    const SQLInjectionSanitizer = require('../sanitizers/search/SQLInjectionSanitizer.js').default;
    const XSSSanitizer = require('../sanitizers/frontend/XSSSanitizer.js').default;
    const EncodingSanitizer = require('../sanitizers/shared/EncodingSanitizer.js').default;
    const LengthSanitizer = require('../sanitizers/shared/LengthSanitizer.js').default;
    
    const pipeline = new SanitizerPipeline('user-input-preset');
    pipeline
      .addStage(new SQLInjectionSanitizer(), 'sql-protection')
      .addStage(new XSSSanitizer(), 'xss-protection')
      .addStage(new EncodingSanitizer(), 'encoding')
      .addStage(new LengthSanitizer({ maxLength: 1000 }), 'length-check');
    return pipeline;
  }
}
