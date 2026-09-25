import { z } from "zod";

// ==============================
// 🔹 ITEM SCHEMA
// ==============================
const stockTransferItemSchema = z.object({
    itemId: z.string().min(1, "Item ID is required"),

    sku: z
        .string()
        .min(1, "SKU is required")
        .transform((val) => val.toUpperCase().trim()),

    unit: z.string().min(1, "Unit is required"),

    availableQty: z
        .number()
        .min(0, "Available quantity cannot be negative"),

    transferQty: z
        .number()
        .min(0.01, "Transfer quantity must be greater than 0"),

    balancePreview: z.number().min(0).optional(),

    remark: z.string().max(300).optional(),
});

// ==============================
// 🔹 MAIN SCHEMA
// ==============================
export const createStockTransferSchema = z
    .object({
        sourceGodownId: z.string().min(1, "Source godown is required"),

        destinationGodownId: z
            .string()
            .min(1, "Destination godown is required"),

        vehicleNumber: z
            .string()
            .max(20)
            .optional()
            .transform((val) => val?.toUpperCase().trim()),

        driverName: z.string().optional(),

        driverPhone: z
            .string()
            .regex(/^[0-9]{10}$/, "Invalid phone number")
            .optional(),

        items: z
            .array(stockTransferItemSchema)
            .min(1, "At least one item is required"),
    })

    // ==============================
    // 🔥 BUSINESS VALIDATIONS
    // ==============================
    .superRefine((data, ctx) => {
        // ❌ Same godown check
        if (data.sourceGodownId === data.destinationGodownId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Source and destination godown cannot be same",
                path: ["destinationGodownId"],
            });
        }

        // ❌ Item level validation
        data.items.forEach((item, index) => {
            if (item.transferQty > item.availableQty) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${item.sku} transfer quantity exceeds available quantity`,
                    path: ["items", index, "transferQty"],
                });
            }
        });
    });