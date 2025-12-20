// security/pipelines/AsyncSanitizerPipeline.js
export default class AsyncSanitizerPipeline extends SanitizerPipeline {
  constructor(name = 'async-default') {
    super(name);
    this.parallelStages = [];
  }

  /**
   * Добавить параллельную стадию
   */
  addParallelStage(sanitizer, stageName = '') {
    this.parallelStages.push({
      name: stageName || sanitizer.constructor.name,
      sanitizer
    });
    return this;
  }

  /**
   * Выполнить пайплайн с параллельными стадиями
   */
  async execute(input, context = {}) {
    this.context = { ...this.context, ...context };
    let result = input;

    // Последовательные стадии
    for (const stage of this.stages) {
      try {
        result = await stage.sanitizer.sanitize(result);
      } catch (error) {
        console.error(`[AsyncSanitizerPipeline] Sequential stage ${stage.name} failed:`, error);
        throw error;
      }
    }

    // Параллельные стадии
    if (this.parallelStages.length > 0) {
      const parallelResults = await Promise.allSettled(
        this.parallelStages.map(async (stage) => {
          try {
            return await stage.sanitizer.sanitize(result);
          } catch (error) {
            console.error(`[AsyncSanitizerPipeline] Parallel stage ${stage.name} failed:`, error);
            throw error;
          }
        })
      );

      // Обработка результатов параллельных стадий
      for (const [index, promiseResult] of parallelResults.entries()) {
        if (promiseResult.status === 'rejected') {
          throw promiseResult.reason;
        }
        // Объединяем результаты если нужно
        result = this.mergeResults(result, promiseResult.value);
      }
    }

    this.context = {};
    return result;
  }

  /**
   * Слияние результатов параллельной обработки
   */
  mergeResults(original, processed) {
    // Простая реализация - возвращаем последний результат
    // Можно переопределить в наследниках для сложного слияния
    return processed;
  }
}