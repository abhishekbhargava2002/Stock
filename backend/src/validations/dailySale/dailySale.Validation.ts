import { z } from "zod";

const dailySaleItemSchema = z.object({
    itemId: z
        .string({
            required_error: "Item is required",
        })
        .trim()
        .min(1, "Item is required"),

    SkuCode: z
        .string({
            required_error: "SKUCODE is required",
        })
        .min(1, "SKUCode is required"),

    quantity: z.coerce
        .number({
            invalid_type_error: "Quantity must be a number",
        })
        .positive("Quantity must be greater than 0"),

    sellingPrice: z.coerce
        .number({
            invalid_type_error: "Selling price must be a number",
        })
        .min(0, "Selling price must be greater than or equal to 0"),

    totalAmount: z.coerce
        .number({
            invalid_type_error: "Total amount must be a number",
        })
        .min(0, "Total amount must be greater than or equal to 0"),
});



export const createDailySaleSchema = z
    .object({
        facilityId: z
            .string({
                required_error: "Facility is required",
            })
            .trim()
            .min(1, "Facility is required"),

        godownId: z
            .string({
                required_error: "Godown is required",
            })
            .trim()
            .min(1, "Godown is required"),

        saleDate: z.coerce
            .date({
                required_error: "Sale date is required",
            })
            .refine(
                (date) => date <= new Date(),
                "Sale date cannot be a future date"
            ),

        items: z
            .array(dailySaleItemSchema)
            .min(1, "At least one item is required"),

        totalAmount: z.coerce
            .number({
                invalid_type_error: "Total amount must be a number",
            })
            .min(0, "Total amount must be greater than or equal to 0"),

        remark: z
            .string()
            .trim()
            .max(500, "Remark cannot exceed 500 characters")
            .optional()
            .default(""),

        attachment: z
            .string()
            .trim()
            .optional()
            .default(""),
    })
    .strict()
    .superRefine((data, ctx) => {
        // Validate item totals
        let calculatedTotal = 0;

        data.items.forEach((item, index) => {
            const expectedTotal = item.quantity * item.sellingPrice;

            if (Math.abs(expectedTotal - item.totalAmount) > 0.01) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["items", index, "totalAmount"],
                    message: `Total amount should be ${expectedTotal}`,
                });
            }

            calculatedTotal += item.totalAmount;
        });

        // Validate grand total
        if (Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["totalAmount"],
                message: `Total amount should be ${calculatedTotal}`,
            });
        }
    });




const updateDailySaleItemSchema = z.object({
    itemId: z
        .string()
        .trim()
        .min(1, "Item is required")
        .optional(),

    SkuCode: z
        .string()
        .trim()
        .min(1, "SKU Code is required")
        .optional(),

    quantity: z.coerce
        .number({
            invalid_type_error: "Quantity must be a number",
        })
        .positive("Quantity must be greater than 0")
        .optional(),

    sellingPrice: z.coerce
        .number({
            invalid_type_error: "Selling price must be a number",
        })
        .min(0, "Selling price must be greater than or equal to 0")
        .optional(),

    totalAmount: z.coerce
        .number({
            invalid_type_error: "Total amount must be a number",
        })
        .min(0, "Total amount must be greater than or equal to 0")
        .optional(),
});

export type CreateDailySaleInput = z.infer<typeof createDailySaleSchema>;


export const updateDailySaleSchema = z
    .object({
        facilityId: z
            .string()
            .trim()
            .min(1, "Facility is required")
            .optional(),

        godownId: z
            .string()
            .trim()
            .min(1, "Godown is required")
            .optional(),

        saleDate: z.coerce
            .date()
            .refine(
                (date) => date <= new Date(),
                "Sale date cannot be a future date"
            )
            .optional(),

        items: z
            .array(updateDailySaleItemSchema)
            .min(1, "At least one item is required")
            .optional(),

        totalAmount: z.coerce
            .number({
                invalid_type_error: "Total amount must be a number",
            })
            .min(0, "Total amount must be greater than or equal to 0")
            .optional(),

        remark: z
            .string()
            .trim()
            .max(500, "Remark cannot exceed 500 characters")
            .optional(),

        attachment: z
            .string()
            .trim()
            .optional(),
    })
    .strict();



export type UpdateDailySaleInput = z.infer<typeof updateDailySaleSchema>;