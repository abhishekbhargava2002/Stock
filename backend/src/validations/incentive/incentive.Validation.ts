import { z } from "zod";

const incentiveSlabSchema = z.object({
    fromValue: z.coerce
        .number()
        .min(0, "From value must be greater than or equal to 0"),

    toValue: z.coerce
        .number()
        .nullable()
        .optional(),

    incentiveValue: z.coerce
        .number()
        .min(0, "Incentive value must be greater than or equal to 0"),

    maximumIncentiveLimit: z.coerce
        .number()
        .min(0, "Maximum incentive limit must be greater than or equal to 0")
        .optional()
        .default(0),
});

export const createIncentiveRuleSchema = z
    .object({

        // STEP 1 : RULE DETAILS
        ruleName: z
            .string({
                required_error: "Rule name is required",
            })
            .trim()
            .min(1, "Rule name is required"),

        description: z
            .string()
            .trim()
            .optional()
            .default(""),

        status: z
            .enum(["active", "inactive"])
            .optional()
            .default("active"),

        effectiveFrom: z.coerce.date({
            required_error: "Effective from date is required",
        }),

        effectiveTo: z.coerce
            .date()
            .optional(),

        // STEP 2 : APPLICABILITY
        applicability: z.enum(
            ["group", "category", "item"],
            {
                required_error:
                    "Applicability is required",
            }
        ),

        groupId: z.string().optional(),

        categoryId: z.string().optional(),

        itemId: z.string().optional(),

        vendorId: z.string().optional(),

        mainComponent: z
            .string()
            .trim()
            .optional()
            .default(""),

        subComponent: z
            .string()
            .trim()
            .optional()
            .default(""),

        // STEP 3 & 4 : CALCULATION
        incentiveType: z.enum(
            ["amount", "percentage"],
            {
                required_error:
                    "Incentive type is required",
            }
        ),

        applicableOn: z.enum(
            ["quantity", "amount"],
            {
                required_error:
                    "Applicable on is required",
            }
        ),

        ruleType: z.enum(
            ["singular", "slabwise"],
            {
                required_error:
                    "Rule type is required",
            }
        ),

        operator: z
            .enum(["=", ">", "<", ">=", "<="])
            .optional()
            .default(">="),

        threshold: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        incentiveValue: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        minimumSaleValue: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        maximumIncentiveLimit: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        slabs: z
            .array(incentiveSlabSchema)
            .optional()
            .default([]),

        remarks: z
            .string()
            .trim()
            .optional()
            .default(""),
    })
    .superRefine((data, ctx) => {

        // Applicability Validation
        if (data.applicability === "group" && !data.groupId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["groupId"],
                message:
                    "Group is required when applicability is group",
            });
        }

        if (data.applicability === "category" && !data.categoryId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["categoryId"],
                message:
                    "Category is required when applicability is category",
            });
        }

        if (data.applicability === "item" && !data.itemId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["itemId"],
                message:
                    "Item is required when applicability is item",
            });
        }

        // Date Validation
        if (data.effectiveTo && data.effectiveTo < data.effectiveFrom) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["effectiveTo"],
                message:
                    "Effective To must be greater than Effective From",
            });
        }

        // Rule Type Validation
        if (data.ruleType === "singular") {
            if (data.threshold <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["threshold"],
                    message:
                        "Threshold is required for singular rule",
                });
            }

            if (data.incentiveValue <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["incentiveValue"],
                    message:
                        "Incentive value is required for singular rule",
                });
            }
        }

        if (data.ruleType === "slabwise") {
            if (!data.slabs.length) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["slabs"],
                    message:
                        "At least one slab is required for slabwise rule",
                });
            }
        }

        // Percentage Validation
        if (data.incentiveType === "percentage" && data.ruleType === "singular" && data.incentiveValue > 100) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["incentiveValue"],
                message:
                    "Percentage incentive cannot exceed 100",
            });
        }
    });

export type CreateIncentiveRuleInput = z.infer<typeof createIncentiveRuleSchema>;



const updateincentiveSlabSchema = z.object({
    fromValue: z.coerce
        .number()
        .min(0, "From value must be greater than or equal to 0"),

    toValue: z.coerce
        .number()
        .nullable()
        .optional(),

    incentiveValue: z.coerce
        .number()
        .min(0, "Incentive value must be greater than or equal to 0"),

    maximumIncentiveLimit: z.coerce
        .number()
        .min(0, "Maximum incentive limit must be greater than or equal to 0")
        .optional()
        .default(0),
});


export const updateIncentiveRuleSchema = z
    .object({
        ruleName: z
            .string()
            .trim()
            .min(1, "Rule name is required").optional(),

        description: z
            .string()
            .trim()
            .optional()
            .default(""),

        status: z.enum(["active", "inactive"]).optional(),

        effectiveFrom: z.coerce
            .date()
            .optional(),

        effectiveTo: z.coerce
            .date()
            .optional(),

        applicability: z.enum([
            "group",
            "category",
            "item",
        ]).optional(),

        groupId: z.string().optional(),

        categoryId: z.string().optional(),

        itemId: z.string().optional(),

        vendorId: z.string().optional(),

        mainComponent: z
            .string()
            .optional()
            .default(""),

        subComponent: z
            .string()
            .optional()
            .default(""),

        incentiveType: z.enum([
            "amount",
            "percentage",
        ]).optional(),

        applicableOn: z.enum([
            "quantity",
            "amount",
        ]).optional(),

        ruleType: z.enum([
            "singular",
            "slabwise",
        ]).optional(),

        operator: z.enum([
            "=",
            ">",
            "<",
            ">=",
            "<=",
        ]).optional(),

        threshold: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        incentiveValue: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        minimumSaleValue: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        maximumIncentiveLimit: z.coerce
            .number()
            .min(0)
            .optional()
            .default(0),

        slabs: z
            .array(updateincentiveSlabSchema)
            .optional()
            .default([]),

        remarks: z
            .string()
            .trim()
            .optional()
            .default(""),
    })
    .superRefine((data, ctx) => {

        // Applicability Validation
        if (
            data.applicability === "group" &&
            !data.groupId
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["groupId"],
                message: "Group is required",
            });
        }

        if (
            data.applicability === "category" &&
            !data.categoryId
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["categoryId"],
                message: "Category is required",
            });
        }

        if (
            data.applicability === "item" &&
            !data.itemId
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["itemId"],
                message: "Item is required",
            });
        }

        if (
            data.effectiveFrom &&
            data.effectiveTo &&
            data.effectiveTo < data.effectiveFrom
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["effectiveTo"],
                message:
                    "Effective To must be greater than Effective From",
            });
        }

        // Singular Rule Validation
        if (data.ruleType === "singular") {

            if (data.threshold <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["threshold"],
                    message:
                        "Threshold is required for singular rule",
                });
            }

            if (data.incentiveValue <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["incentiveValue"],
                    message:
                        "Incentive value is required for singular rule",
                });
            }

            if (
                data.incentiveType === "percentage" &&
                data.incentiveValue > 100
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["incentiveValue"],
                    message:
                        "Percentage incentive cannot exceed 100",
                });
            }
        }

        // Slabwise Rule Validation
        if (data.ruleType === "slabwise") {

            if (!data.slabs.length) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["slabs"],
                    message:
                        "At least one slab is required",
                });
            }

            data.slabs.forEach((slab, index) => {

                if (
                    slab.toValue !== null &&
                    slab.toValue !== undefined &&
                    slab.toValue < slab.fromValue
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [
                            "slabs",
                            index,
                            "toValue",
                        ],
                        message:
                            "To value must be greater than From value",
                    });
                }

                if (
                    data.incentiveType ===
                    "percentage" &&
                    slab.incentiveValue > 100
                ) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [
                            "slabs",
                            index,
                            "incentiveValue",
                        ],
                        message:
                            "Percentage incentive cannot exceed 100",
                    });
                }
            });
        }
    });