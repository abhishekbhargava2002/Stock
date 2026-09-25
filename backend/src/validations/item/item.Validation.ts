import { z } from "zod";

// ================= COMMON HELPERS =================

// Mongo ObjectId validation
const objectIdSchema = (fieldName: string) =>
    z.string({
        required_error: `${fieldName} is required`,
        invalid_type_error: `${fieldName} must be a string`,
    })
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, {
            message: `Invalid ${fieldName}`,
        });

// Number field helper
const numberField = (fieldName: string) =>
    z.number({
        required_error: `${fieldName} is required`,
        invalid_type_error: `${fieldName} must be a number`,
    });

// Optional number helper
const optionalNumberField = (fieldName: string) =>
    z
        .number({
            invalid_type_error: `${fieldName} must be a number`,
        })
        .optional();

// ================= CREATE ITEM =================


export const createItemSchema = z
    .object({
        // ================= BASIC DETAILS =================

        itemName: z
            .string({
                required_error: "Item name is required",
                invalid_type_error:
                    "Item name must be a string",
            })
            .trim()
            .min(2, {
                message:
                    "Item name must be at least 2 characters",
            }),

        description: z
            .string({
                invalid_type_error:
                    "Description must be a string",
            })
            .trim()
            .optional(),

        skuCode: z
            .string({
                required_error: "SKU code is required",
                invalid_type_error:
                    "SKU code must be a string",
            })
            .trim()
            .min(1, {
                message: "SKU code is required",
            })
            .transform((val) => val.toUpperCase()),

        itemPhoto: z
            .string({
                invalid_type_error:
                    "Item photo must be a string",
            })
            .url({
                message: "Invalid image URL",
            })
            .optional(),

        openingQuantity: numberField(
            "Opening quantity"
        )
            .min(0, {
                message: "Quantity cannot be negative",
            })
            .default(0),

        // ================= RELATIONS =================

        group: objectIdSchema("Group"),

        category: objectIdSchema("Category"),

        openingGodown:
            objectIdSchema("Opening godown"),


        // ================= ADDITIONAL DETAILS =================

        partNumber: z
            .string({
                invalid_type_error:
                    "Part number must be a string",
            })
            .trim()
            .optional(),

        batchNumber: z
            .string({
                invalid_type_error:
                    "Batch number must be a string",
            })
            .trim()
            .optional(),

        manufacturingDate: z
            .coerce
            .date({
                invalid_type_error:
                    "Manufacturing date must be a valid date",
            })
            .optional(),

        expiryDate: z
            .coerce
            .date({
                invalid_type_error:
                    "Expiry date must be a valid date",
            })
            .optional(),

        // ================= PRICING =================

        mrp: optionalNumberField("MRP")
            .refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "MRP cannot be negative",
                }
            ),

        standardSellingPrice:
            optionalNumberField(
                "Standard selling price"
            ).refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "Selling price cannot be negative",
                }
            ),

        // ================= UNITS =================

        primaryUnit:
            objectIdSchema("Primary unit"),

        secondaryUnit:
            objectIdSchema("Secondary unit")
                .optional(),

        conversionRate:
            optionalNumberField(
                "Conversion rate"
            ).refine(
                (val) =>
                    val === undefined || val >= 1,
                {
                    message:
                        "Conversion rate must be at least 1",
                }
            ),

        // ================= LOW STOCK =================

        lowStockQuantity:
            optionalNumberField(
                "Low stock quantity"
            ).refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "Low stock quantity cannot be negative",
                }
            ),

        lowStockNotification: z
            .boolean({
                invalid_type_error:
                    "Low stock notification must be true or false",
            })
            .optional(),
    })

    // ================= CUSTOM VALIDATIONS =================

    .superRefine((data, ctx) => {
        // Expiry date validation
        if (
            data.manufacturingDate &&
            data.expiryDate &&
            data.expiryDate < data.manufacturingDate
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expiryDate"],
                message:
                    "Expiry date cannot be before manufacturing date",
            });
        }

        // Selling price validation
        if (
            data.mrp !== undefined &&
            data.standardSellingPrice !==
            undefined &&
            data.standardSellingPrice > data.mrp
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["standardSellingPrice"],
                message:
                    "Selling price should not exceed MRP",
            });
        }

        // Conversion rate required
        if (
            data.secondaryUnit &&
            !data.conversionRate
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["conversionRate"],
                message:
                    "Conversion rate is required when secondary unit exists",
            });
        }

        // Prevent same primary & secondary unit
        if (
            data.primaryUnit &&
            data.secondaryUnit &&
            data.primaryUnit ===
            data.secondaryUnit
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["secondaryUnit"],
                message:
                    "Primary unit and secondary unit cannot be same",
            });
        }
    });

// ================= UPDATE ITEM =================

export const updateItemSchema = z
    .object({
        itemName: z
            .string({
                invalid_type_error:
                    "Item name must be a string",
            })
            .trim()
            .min(2, {
                message:
                    "Item name must be at least 2 characters",
            })
            .optional(),

        description: z
            .string({
                invalid_type_error:
                    "Description must be a string",
            })
            .trim()
            .optional(),

        skuCode: z
            .string({
                invalid_type_error: "SKU code must be a string",
            })
            .trim()
            .optional()
            .transform((val) => val ? val.toUpperCase() : val),

        itemPhoto: z
            .string({
                invalid_type_error:
                    "Item photo must be a string",
            })
            .url({
                message: "Invalid image URL",
            })
            .optional(),

        openingQuantity:
            optionalNumberField(
                "Opening quantity"
            ).refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "Quantity cannot be negative",
                }
            ),

        group: objectIdSchema("Group").optional(),

        category: objectIdSchema("Category").optional(),

        openingGodown: objectIdSchema("Opening godown").optional(),

        partNumber: z
            .string({
                invalid_type_error:
                    "Part number must be a string",
            })
            .trim()
            .optional(),

        batchNumber: z
            .string({
                invalid_type_error:
                    "Batch number must be a string",
            })
            .trim()
            .optional(),

        manufacturingDate: z
            .coerce
            .date({
                invalid_type_error:
                    "Manufacturing date must be a valid date",
            })
            .optional(),

        expiryDate: z
            .coerce
            .date({
                invalid_type_error:
                    "Expiry date must be a valid date",
            })
            .optional(),

        mrp: optionalNumberField("MRP")
            .refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "MRP cannot be negative",
                }
            ),

        standardSellingPrice:
            optionalNumberField(
                "Standard selling price"
            ).refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "Selling price cannot be negative",
                }
            ),

        primaryUnit: objectIdSchema("Primary unit").optional(),

        secondaryUnit: objectIdSchema("Secondary unit").optional(),

        conversionRate:
            optionalNumberField(
                "Conversion rate"
            ).refine(
                (val) =>
                    val === undefined || val >= 1,
                {
                    message:
                        "Conversion rate must be at least 1",
                }
            ),

        lowStockQuantity:
            optionalNumberField(
                "Low stock quantity"
            ).refine(
                (val) =>
                    val === undefined || val >= 0,
                {
                    message:
                        "Low stock quantity cannot be negative",
                }
            ),

        lowStockNotification: z
            .boolean({
                invalid_type_error:
                    "Low stock notification must be true or false",
            })
            .optional(),
    })

    .superRefine((data, ctx) => {
        // Expiry date validation
        if (
            data.manufacturingDate &&
            data.expiryDate &&
            data.expiryDate < data.manufacturingDate
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["expiryDate"],
                message:
                    "Expiry date cannot be before manufacturing date",
            });
        }

        // Selling price validation
        if (
            data.mrp !== undefined &&
            data.standardSellingPrice !==
            undefined &&
            data.standardSellingPrice > data.mrp
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["standardSellingPrice"],
                message:
                    "Selling price should not exceed MRP",
            });
        }

        // Conversion rate validation
        if (
            data.secondaryUnit &&
            !data.conversionRate
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["conversionRate"],
                message:
                    "Conversion rate is required when secondary unit exists",
            });
        }

        // Prevent same units
        if (
            data.primaryUnit &&
            data.secondaryUnit &&
            data.primaryUnit ===
            data.secondaryUnit
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["secondaryUnit"],
                message:
                    "Primary unit and secondary unit cannot be same",
            });
        }
    });

// ================= TYPES =================

export type CreateItemInput = z.infer<typeof createItemSchema>;

export type UpdateItemInput = z.infer<typeof updateItemSchema>;