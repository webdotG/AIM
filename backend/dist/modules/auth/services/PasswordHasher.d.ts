export declare class PasswordHasher {
    private readonly pepper;
    private readonly saltRounds;
    private readonly minPasswordLength;
    private readonly maxPasswordLength;
    private readonly requiredPatterns;
    constructor();
    hash(password: string): Promise<string>;
    verify(password: string, hash: string): Promise<boolean>;
    generateBackupCode(): string;
    hashBackupCode(backupCode: string): Promise<string>;
    verifyBackupCode(backupCode: string, hash: string): Promise<boolean>;
    checkStrength(password: string): {
        isStrong: boolean;
        score: number;
        reasons: string[];
        suggestions: string[];
    };
    private hasWeakPatterns;
    private hasRepeatingChars;
    private estimateEntropy;
    private applyPepper;
    private validatePasswordLength;
    generatePasswordRecommendation(): string;
}
export declare const passwordHasher: PasswordHasher;
//# sourceMappingURL=PasswordHasher.d.ts.map