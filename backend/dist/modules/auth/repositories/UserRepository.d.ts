export declare class UserRepository {
    existsByLogin(login: string): Promise<boolean>;
    findByLogin(login: string): Promise<any>;
    findById(id: number): Promise<any>;
    create(data: {
        login: string;
        password_hash: string;
        backup_code_hash: string;
    }): Promise<any>;
    update(id: number, data: {
        password_hash: string;
        backup_code_hash: string;
    }): Promise<void>;
    findAll(): Promise<any[]>;
}
//# sourceMappingURL=UserRepository.d.ts.map