export declare class TestHelpers {
    static registerUser(login: string, password: string): Promise<{
        user: any;
        token: any;
        backupCode: any;
    }>;
    static loginUser(login: string, password: string): Promise<{
        user: any;
        token: any;
    }>;
    static createToken(userId: number, login: string): string;
    static authHeader(token: string): string;
    static expectValidationError(response: any, field?: string): void;
    static expectAuthError(response: any): void;
    static randomString(length?: number): string;
    static generateLogin(): string;
    static generateStrongPassword(): string;
    static sleep(ms: number): Promise<void>;
    static measureTime<T>(fn: () => Promise<T>): Promise<{
        result: T;
        elapsed: number;
    }>;
    static isValidUUID(uuid: string): boolean;
    static isValidISODate(date: string): boolean;
    static createMockRequest(overrides?: any): any;
    static createMockResponse(): any;
    static createMockNext(): jest.Mock<any, any, any>;
}
//# sourceMappingURL=test-helpers.d.ts.map