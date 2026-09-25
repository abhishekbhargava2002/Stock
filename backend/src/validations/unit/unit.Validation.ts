import { z } from "zod";

// CREATE UNIT VALIDATION
export const createUnitSchema = z.object({
    unitName: z
        .string({
            required_error: "Unit name is required",
            invalid_type_error: "Unit name must be a string",
        })
        .trim()
        .min(1, "Unit name is required"),

    shortCode: z
        .string({
            required_error: "Short code is required",
            invalid_type_error: "Short code must be a string",
        })
        .trim()
        .min(1, "Short code is required")
        .max(10, "Short code must be less than 10 characters")
        .transform((val) => val.toUpperCase()),

    status: z.enum(["active", "inactive"], {
        required_error: "Status is required",
        invalid_type_error: "Invalid status type",
    }),

    description: z
        .string({
            invalid_type_error: "Description must be a string",
        })
        .trim()
        .optional(),
});


// UPDATE UNIT VALIDATION
export const updateUnitSchema = z.object({
    unitName: z
        .string({
            invalid_type_error: "Unit name must be a string",
        })
        .trim()
        .min(1, "Unit name cannot be empty")
        .optional(),

    shortCode: z
        .string({
            invalid_type_error: "Short code must be a string",
        })
        .trim()
        .max(10, "Short code must be less than 10 characters")
        .transform((val) => val.toUpperCase())
        .optional(),

    status: z
        .enum(["active", "inactive"], {
            invalid_type_error: "Invalid status type",
        })
        .optional(),

    description: z
        .string({
            invalid_type_error: "Description must be a string",
        })
        .trim()
        .optional(),
});