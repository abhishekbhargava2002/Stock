import { z } from "zod";

export const createGroupSchema = z.object({
    groupName: z
        .string({
            required_error: "Group name is required",
            invalid_type_error: "Group name must be a string",
        })
        .trim()
        .min(2, "Group name must be at least 2 characters")
        .max(50, "Group name cannot exceed 50 characters"),

    description: z
        .string({
            invalid_type_error: "Description must be a string",
        })
        .trim()
        .max(200, "Description cannot exceed 200 characters")
        .optional(),

    status: z.enum(["active", "inactive"], {
        required_error: "Status is required",
        invalid_type_error: "Status must be active or inactive",
    }),
});



export const updateGroupSchema = z.object({

    groupName: z
        .string({
            invalid_type_error: "Group name must be a string",
        })
        .trim()
        .min(2, "Group name must be at least 2 characters")
        .max(50, "Group name cannot exceed 50 characters")
        .optional(),

    description: z
        .string({
            invalid_type_error: "Description must be a string",
        })
        .trim()
        .max(200, "Description cannot exceed 200 characters")
        .optional(),

    status: z
        .enum(["active", "inactive"], {
            invalid_type_error: "Status must be active or inactive",
        })
        .optional(),

});