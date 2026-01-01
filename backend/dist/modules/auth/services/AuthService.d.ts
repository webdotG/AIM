import { UserRepository } from '../repositories/UserRepository';
import { RegisterInput, LoginInput, UpdatePasswordInput } from '../schemas/auth.schema';
export declare class AuthService {
    private userRepository;
    constructor(userRepository: UserRepository);
    register(input: RegisterInput): Promise<{
        user: {
            id: number;
            login: string;
        };
        token: string;
        backupCode: string;
    }>;
    login(input: LoginInput): Promise<{
        user: {
            id: number;
            login: string;
        };
        token: string;
    }>;
    updatePassword(input: UpdatePasswordInput): Promise<{
        user: {
            id: number;
            login: string;
        };
        token: string;
        backupCode: string;
    }>;
    validateToken(token: string): Promise<{
        id: number;
        login: string;
    } | null>;
    private delay;
}
//# sourceMappingURL=AuthService.d.ts.map