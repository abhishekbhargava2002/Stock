import { z } from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine(
  (value) => mongoose.Types.ObjectId.isValid(value),
  {
    message: "Invalid ObjectId",
  }
);


const lineItemSchema = z
  .object({
    itemId: objectIdSchema,

    sku: z
      .string({
        required_error: "SKU is required",
      })
      .trim()
      .min(1, "SKU is required")
      .transform((value) =>
        value.toUpperCase()
      ),

    quantity: z
      .number({
        required_error: "Quantity is required",
      })
      .min(1, "Quantity must be at least 1"),

    unitId: objectIdSchema,

    purchasePrice: z
      .number({
        required_error:
          "Purchase price is required",
      })
      .min(
        0,
        "Purchase price cannot be negative"
      ),

    batchNo: z
      .string()
      .trim()
      .optional()
      .default(""),

    remark: z
      .string()
      .trim()
      .optional()
      .default(""),
  })

  .transform((data) => ({
    ...data,

    amount:
      Number(data.quantity) *
      Number(data.purchasePrice),
  }));


export const createStockInSchema = z.object({
  // ==================================================
  // 🔹 VENDOR & INVOICE
  // ==================================================

  vendorId: objectIdSchema,

  purchaseDate: z.coerce.date({
    required_error:
      "Purchase date is required",
  }),

  invoiceNumber: z
    .string()
    .trim()
    .optional()
    .default(""),


  // ==================================================
  // 🔹 GODOWN & VEHICLE
  // ==================================================

  destinationGodownId:
    objectIdSchema,

  vehicleNumber: z
    .string()
    .trim()
    .optional()
    .default(""),

  driverName: z
    .string()
    .trim()
    .optional()
    .default(""),

  driverPhone: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine((val) => {
      if (!val) return true; // allow empty
      return /^[6-9]\d{9}$/.test(val); // Indian mobile numbers
    }, {
      message: "Invalid phone number. Must be 10 digit Indian mobile number",
    }),

  // ==================================================
  // 🔹 ITEMS
  // ==================================================

  items: z
    .array(lineItemSchema)
    .min(1, "At least one item is required"),

  // ==================================================
  // 🔹 STATUS
  // ==================================================

  status: z
    .enum([
      "draft",
      "completed",
      "cancelled",
    ])
    .optional()
    .default("completed"),

  // ==================================================
  // 🔹 NOTES
  // ==================================================

  notes: z
    .string()
    .trim()
    .optional()
    .default(""),
});

// ======================================================
// 🔹 TYPESCRIPT TYPE
// ======================================================

export type CreateStockInInput = z.infer<typeof createStockInSchema>;