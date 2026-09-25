import { z } from "zod";

export const createCategorySchema = z.object({
    categoryName: z
        .string({
            required_error: "Category name is required",
            invalid_type_error:
                "Category name must be a string",
        })
        .trim()
        .min(
            2,
            "Category name must be at least 2 characters"
        )
        .max(
            100,
            "Category name cannot exceed 100 characters"
        ),

    description: z
        .string({
            invalid_type_error:
                "Description must be a string",
        })
        .trim()
        .max(
            500,
            "Description cannot exceed 500 characters"
        )
        .optional(),

    group: z
        .string({
            required_error: "Group is required",
            invalid_type_error:
                "Group id must be a string",
        })
        .trim()
        .min(1, "Group is required")
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid group id"
        ),

    parentCategory: z
        .string({
            invalid_type_error:
                "Parent category id must be a string",
        })
        .trim()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid parent category id"
        )
        .optional()
        .nullable(),

    status: z.enum(
        ["active", "inactive"],
        {
            required_error: "Status is required",
            invalid_type_error:
                "Status must be active or inactive",
        }
    ),
});


export const updateCategorySchema = z.object({
    categoryName: z
        .string({
            invalid_type_error:
                "Category name must be a string",
        })
        .trim()
        .min(
            2,
            "Category name must be at least 2 characters"
        )
        .max(
            100,
            "Category name cannot exceed 100 characters"
        )
        .optional(),

    description: z
        .string({
            invalid_type_error:
                "Description must be a string",
        })
        .trim()
        .max(
            500,
            "Description cannot exceed 500 characters"
        )
        .optional(),

    group: z
        .string({
            invalid_type_error:
                "Group id must be a string",
        })
        .trim()
        .min(1, "Group is required")
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid group id"
        )
        .optional(),


    parentCategory: z
        .string({
            invalid_type_error:
                "Parent category id must be a string",
        })
        .trim()
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid parent category id"
        )
        .optional()
        .nullable(),

    status: z.enum(
        ["active", "inactive"],
        {
            invalid_type_error:
                "Status must be active or inactive",
        }
    ).optional(),

});