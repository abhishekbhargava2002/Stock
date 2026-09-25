import { z } from "zod";

export const createManualAdjustmentSchema = z.object({
    itemId: z.string().trim().min(1, "Item is required"),

    godownId: z.string().trim().min(1, "Godown is required"),

    sku: z
        .string()
        .trim()
        .min(1, "SKU is required")
        .transform((val) => val.toUpperCase()),

    physicalQuantity: z
        .union([z.number(), z.string()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, {
            message: "Physical quantity must be a valid number ≥ 0",
        }),

    remark: z
        .string()
        .trim()
        .min(1, "Remark is required")
        .max(500, "Remark cannot exceed 500 characters"),

    attachment: z.string().optional(),
}).strict();