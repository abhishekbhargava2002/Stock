import { z } from "zod";

export const updateFacilitySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Facility name must be at least 2 characters")
        .optional(),

    code: z
        .string()
        .trim()
        .min(2, "Facility code must be at least 2 characters")
        .transform((value) => value.toUpperCase())
        .optional(),

    city: z
        .string()
        .trim()
        .optional(),

    state: z
        .string()
        .trim()
        .optional(),

    address: z
        .string()
        .trim()
        .optional(),

});