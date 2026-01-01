declare const _default: {
    database: {
        host: string | undefined;
        port: number;
        name: string | undefined;
        user: string | undefined;
        password: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string | undefined;
    };
    password: {
        pepper: string | undefined;
        saltRounds: number;
        minLength: number;
        requireSpecialChars: boolean;
        requireNumbers: boolean;
        requireMixedCase: boolean;
    };
    server: {
        port: number;
        env: string;
    };
    logging: {
        level: string;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map