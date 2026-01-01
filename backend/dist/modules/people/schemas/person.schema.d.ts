import { z } from 'zod';
export declare const createPersonSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        category: z.ZodEnum<{
            family: "family";
            friends: "friends";
            acquaintances: "acquaintances";
            strangers: "strangers";
        }>;
        relationship: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        birth_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updatePersonSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodEnum<{
            family: "family";
            friends: "friends";
            acquaintances: "acquaintances";
            strangers: "strangers";
        }>>;
        relationship: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        bio: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        birth_date: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const personIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getPeopleSchema: z.ZodObject<{
    query: z.ZodObject<{
        category: z.ZodOptional<z.ZodEnum<{
            family: "family";
            friends: "friends";
            acquaintances: "acquaintances";
            strangers: "strangers";
        }>>;
        search: z.ZodOptional<z.ZodString>;
        sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            name: "name";
            mentions: "mentions";
            created_at: "created_at";
        }>>>;
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const mostMentionedSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=person.schema.d.ts.map