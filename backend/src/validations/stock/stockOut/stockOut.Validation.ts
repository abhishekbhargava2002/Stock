import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const createStockOutSchema = z.object({
    godownId: objectId,
    vendorId: objectId,

    vehicleNumber: z.string().trim().optional(),
    driverName: z.string().trim().optional(),

    driverPhone: z
        .string()
        .trim()
        .optional()
        .refine(
            (val) => !val || /^[0-9]{10}$/.test(val),
            "Invalid phone number"
        ),

    invoiceFile: z.string().trim().optional(),

    items: z
        .array(
            z.object({
                itemId: objectId,

                sku: z
                    .string()
                    .trim()
                    .min(1, "SKU is required")
                    .transform((val) => val.toUpperCase()),

                unitId: objectId,

                quantity: z
                    .union([z.number(), z.string()])
                    .transform((val) => Number(val))
                    .refine((val) => !isNaN(val) && val > 0, {
                        message: "Quantity must be a valid number > 0",
                    }),

                remark: z.string().trim().optional(),
            })
        )
        .min(1, "At least one item is required"),
});