import { z } from "zod";
import mongoose from "mongoose";

export const createGodownValidation = z.object({
    godownName: z
        .string({
            required_error: "Godown is required",
            invalid_type_error: "Godown must be string"
        })
        .trim()
        .min(2, "Godown name must be at least 2 characters")
        .max(100, "Godown name cannot exceed 100 characters"),

    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),

    address: z
        .string({
            required_error: "Address is required",
            invalid_type_error: "Address must be string"
        }).trim()
        .min(5, "Address is required")
        .max(500, "Address cannot exceed 500 characters"),

    isDefault: z
        .boolean()
        .optional()
        .default(false),

    status: z
        .enum(["active", "inactive"])
        .optional()
        .default("active"),
});


export const updateGodownValidation = z.object({
    godownName: z
        .string({
            invalid_type_error: "Godown must be string"
        })
        .trim()
        .min(2, "Godown name must be at least 2 characters")
        .max(100, "Godown name cannot exceed 100 characters")
        .optional(),

    description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional()
        .or(z.literal("")),

    address: z
        .string({
            invalid_type_error: "Address must be string"
        }).trim()
        .min(5, "Address is required")
        .max(500, "Address cannot exceed 500 characters")
        .optional(),

    isDefault: z
        .boolean()
        .optional()
        .default(false),
});