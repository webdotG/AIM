import { z } from 'zod';
export declare const createCircumstanceSchema: z.ZodObject<{
    body: z.ZodObject<{
        timestamp: z.ZodOptional<z.ZodString>;
        weather: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            sunny: "sunny";
            rainy: "rainy";
            snowy: "snowy";
            stormy: "stormy";
            cloudy: "cloudy";
            foggy: "foggy";
            windy: "windy";
        }>>>;
        temperature: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        moon_phase: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            new_moon: "new_moon";
            waxing_crescent: "waxing_crescent";
            first_quarter: "first_quarter";
            waxing_gibbous: "waxing_gibbous";
            full_moon: "full_moon";
            waning_gibbous: "waning_gibbous";
            last_quarter: "last_quarter";
            waning_crescent: "waning_crescent";
        }>>>;
        global_event: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateCircumstanceSchema: z.ZodObject<{
    body: z.ZodObject<{
        timestamp: z.ZodOptional<z.ZodString>;
        weather: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            sunny: "sunny";
            rainy: "rainy";
            snowy: "snowy";
            stormy: "stormy";
            cloudy: "cloudy";
            foggy: "foggy";
            windy: "windy";
        }>>>;
        temperature: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        moon_phase: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            new_moon: "new_moon";
            waxing_crescent: "waxing_crescent";
            first_quarter: "first_quarter";
            waxing_gibbous: "waxing_gibbous";
            full_moon: "full_moon";
            waning_gibbous: "waning_gibbous";
            last_quarter: "last_quarter";
            waning_crescent: "waning_crescent";
        }>>>;
        global_event: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const circumstanceIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getCircumstancesSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
        weather: z.ZodOptional<z.ZodEnum<{
            sunny: "sunny";
            rainy: "rainy";
            snowy: "snowy";
            stormy: "stormy";
            cloudy: "cloudy";
            foggy: "foggy";
            windy: "windy";
        }>>;
        moon_phase: z.ZodOptional<z.ZodEnum<{
            new_moon: "new_moon";
            waxing_crescent: "waxing_crescent";
            first_quarter: "first_quarter";
            waxing_gibbous: "waxing_gibbous";
            full_moon: "full_moon";
            waning_gibbous: "waning_gibbous";
            last_quarter: "last_quarter";
            waning_crescent: "waning_crescent";
        }>>;
        has_global_event: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
            false: "false";
            true: "true";
        }>, z.ZodTransform<boolean, "false" | "true">>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=circumstance.schema.d.ts.map