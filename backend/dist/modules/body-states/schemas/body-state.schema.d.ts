import { z } from 'zod';
export declare const createBodyStateSchema: z.ZodObject<{
    body: z.ZodObject<{
        timestamp: z.ZodOptional<z.ZodString>;
        location_point: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, z.core.$strip>>>;
        location_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        location_address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        location_precision: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            exact: "exact";
            approximate: "approximate";
            city: "city";
            country: "country";
        }>>>;
        health_points: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        energy_points: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        circumstance_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateBodyStateSchema: z.ZodObject<{
    body: z.ZodObject<{
        timestamp: z.ZodOptional<z.ZodString>;
        location_point: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, z.core.$strip>>>;
        location_name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        location_address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        location_precision: z.ZodNullable<z.ZodOptional<z.ZodEnum<{
            exact: "exact";
            approximate: "approximate";
            city: "city";
            country: "country";
        }>>>;
        health_points: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        energy_points: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        circumstance_id: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const bodyStateIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getBodyStatesSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
        from: z.ZodOptional<z.ZodString>;
        to: z.ZodOptional<z.ZodString>;
        has_location: z.ZodOptional<z.ZodPipe<z.ZodEnum<{
            false: "false";
            true: "true";
        }>, z.ZodTransform<boolean, "false" | "true">>>;
        circumstance_id: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=body-state.schema.d.ts.map