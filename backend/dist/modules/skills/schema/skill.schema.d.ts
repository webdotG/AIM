import { z } from 'zod';
export declare const createSkillSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        category: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        color: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateSkillSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        category: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        current_level: z.ZodOptional<z.ZodNumber>;
        experience_points: z.ZodOptional<z.ZodNumber>;
        icon: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        color: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const skillIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getSkillsSchema: z.ZodObject<{
    query: z.ZodObject<{
        category: z.ZodOptional<z.ZodString>;
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        sort: z.ZodOptional<z.ZodEnum<{
            name: "name";
            level: "level";
            created_at: "created_at";
            experience: "experience";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const addProgressSchema: z.ZodObject<{
    body: z.ZodObject<{
        entry_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        body_state_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        progress_type: z.ZodDefault<z.ZodEnum<{
            practice: "practice";
            achievement: "achievement";
            lesson: "lesson";
            milestone: "milestone";
        }>>;
        experience_gained: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const topSkillsSchema: z.ZodObject<{
    query: z.ZodObject<{
        limit: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
        category: z.ZodOptional<z.ZodString>;
        min_level: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const progressHistorySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        progress_type: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
            all: "all";
            practice: "practice";
            achievement: "achievement";
            lesson: "lesson";
            milestone: "milestone";
        }>>>;
        start_date: z.ZodOptional<z.ZodString>;
        end_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=skill.schema.d.ts.map