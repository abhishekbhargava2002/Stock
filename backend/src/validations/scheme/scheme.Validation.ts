import { z } from "zod";
export enum RoleType {
    CLIENT_SUPER_ADMIN = "Client Super Admin",
    ADMIN = "Admin",
    FACILITY_ADMIN = "Facility Admin",
    STOCK_MANAGER = "Stock Manager",
    SALES_OPERATOR = "Sales Operator",
    REPORT_VIEWER = "Report Viewer",
};


export const createSchemeSchema = z
    .object({
        schemeName: z
            .string({
                required_error: "Scheme name is required",
            })
            .trim()
            .min(1, "Scheme name is required"),

        description: z
            .string()
            .trim()
            .optional()
            .default(""),

        applicableTo: z.nativeEnum(RoleType, {
            required_error:
                "Applicable role is required",
        }),

        startDate: z.coerce.date({
            required_error: "Start date is required",
        }),

        endDate: z.coerce
            .date()
            .optional(),

        ruleIds: z
            .array(
                z.string().trim().min(1)
            )
            .min(
                1,
                "At least one incentive rule is required"
            ),

        allowMultipleSchemes: z
            .boolean()
            .optional()
            .default(false),

        status: z
            .enum(["active", "inactive"])
            .optional()
            .default("active"),

        remarks: z
            .string()
            .trim()
            .optional()
            .default(""),
    })
    .superRefine((data, ctx) => {
        if (
            data.endDate &&
            data.endDate < data.startDate
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message:
                    "End date must be greater than start date",
            });
        }
    });

export type CreateSchemeInput = z.infer<
    typeof createSchemeSchema
>;

export const updateSchemeSchema = z
    .object({
        schemeName: z
            .string()
            .trim()
            .min(1)
            .optional(),

        description: z
            .string()
            .trim()
            .optional(),

        applicableTo: z
            .nativeEnum(RoleType)
            .optional(),

        startDate: z.coerce
            .date()
            .optional(),

        endDate: z.coerce
            .date()
            .optional(),

        ruleIds: z
            .array(
                z.string().trim().min(1)
            )
            .optional(),

        allowMultipleSchemes:
            z.boolean().optional(),

        status: z
            .enum(["active", "inactive"])
            .optional(),

        remarks: z
            .string()
            .trim()
            .optional(),
    })
    .superRefine((data, ctx) => {
        if (
            data.startDate &&
            data.endDate &&
            data.endDate < data.startDate
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endDate"],
                message:
                    "End date must be greater than start date",
            });
        }

        if (
            data.ruleIds &&
            data.ruleIds.length === 0
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["ruleIds"],
                message:
                    "At least one incentive rule is required",
            });
        }
    });

export type UpdateSchemeInput = z.infer<
    typeof updateSchemeSchema
>;