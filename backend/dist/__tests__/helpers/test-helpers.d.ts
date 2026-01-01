export declare class TestHelpers {
    /**
     * Регистрирует пользователя и возвращает данные с токеном
     */
    static registerUser(login: string, password: string): Promise<{
        user: any;
        token: any;
        backupCode: any;
    }>;
    /**
     * Логинит пользователя
     */
    static loginUser(login: string, password: string): Promise<{
        user: any;
        token: any;
    }>;
    /**
     * Создает JWT токен для пользователя (без регистрации)
     */
    static createToken(userId: number, login: string): string;
    /**
     * Создает Authorization header
     */
    static authHeader(token: string): string;
    /**
     * Проверяет что ответ содержит ошибку валидации
     */
    static expectValidationError(response: any, field?: string): void;
    /**
     * Проверяет что ответ содержит ошибку авторизации
     */
    static expectAuthError(response: any): void;
    /**
     * Генерирует случайную строку
     */
    static randomString(length?: number): string;
    /**
     * Генерирует валидный логин
     */
    static generateLogin(): string;
    /**
     * Генерирует сильный пароль
     */
    static generateStrongPassword(): string;
    /**
     * Ждет указанное количество миллисекунд
     */
    static sleep(ms: number): Promise<void>;
    /**
     * Измеряет время выполнения функции
     */
    static measureTime<T>(fn: () => Promise<T>): Promise<{
        result: T;
        elapsed: number;
    }>;
    /**
     * Форматирует UUID для проверок
     */
    static isValidUUID(uuid: string): boolean;
    /**
     * Проверяет формат даты ISO 8601
     */
    static isValidISODate(date: string): boolean;
    /**
     * Создает мок request для тестирования middleware
     */
    static createMockRequest(overrides?: any): any;
    /**
     * Создает мок response для тестирования middleware
     */
    static createMockResponse(): any;
    /**
     * Создает мок next для тестирования middleware
     */
    static createMockNext(): jest.Mock<any, any, any>;
}
//# sourceMappingURL=test-helpers.d.ts.map