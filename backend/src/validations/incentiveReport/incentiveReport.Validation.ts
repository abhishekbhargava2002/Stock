import { z } from "zod";

export const createIncentiveReportSchema = z
    .object({
        employeeId: z.string().trim().optional(),

        vendorId: z.string().trim().optional(),

        schemeId: z
            .string({
                required_error: "Scheme is required",
            })
            .trim()
            .min(1, "Scheme is required"),

        ruleId: z
            .string({
                required_error: "Rule is required",
            })
            .trim()
            .min(1, "Rule is required"),

        saleAmount: z.coerce
            .number()
            .min(0, "Sale amount cannot be negative"),

        saleQty: z.coerce
            .number()
            .min(0, "Sale quantity cannot be negative"),

        incentiveType: z.enum(
            ["amount", "percentage"],
            {
                required_error:
                    "Incentive type is required",
            }
        ),

        incentiveValue: z.coerce
            .number()
            .min(
                0,
                "Incentive value cannot be negative"
            ),

        finalIncentive: z.coerce
            .number()
            .min(0, "Final incentive cannot be negative"),

        incentiveDate: z.coerce
            .date()
            .optional(),

        remarks: z
            .string()
            .trim()
            .optional()
            .default(""),

        status: z
            .enum([
                "pending",
                "approved",
                "paid",
                "cancelled",
            ])
            .optional()
            .default("pending"),
    })
    .superRefine((data, ctx) => {
        // Either employee or vendor is required
        if (
            !data.employeeId &&
            !data.vendorId
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["employeeId"],
                message:
                    "Either employeeId or vendorId is required",
            });
        }

        // Cannot have both
        if (
            data.employeeId &&
            data.vendorId
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["vendorId"],
                message:
                    "Only one of employeeId or vendorId can be provided",
            });
        }

        // Percentage validation
        if (
            data.incentiveType ===
            "percentage" &&
            data.incentiveValue > 100
        ) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["incentiveValue"],
                message:
                    "Percentage incentive cannot exceed 100",
            });
        }
    });

export type CreateIncentiveReportInput = z.infer<typeof createIncentiveReportSchema>;




export const updateIncentiveReportStatusSchema =
    z.object({
        status: z.enum(
            [
                "pending",
                "approved",
                "paid",
                "cancelled",
            ],
            {
                required_error:
                    "Status is required",
            }
        ),
    });

export type UpdateIncentiveReportStatusInput =
    z.infer<
        typeof updateIncentiveReportStatusSchema
    >;