import { z } from "zod";
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const phone = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit Indian mobile number");
export const organizationSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone, address: z.string().min(5), facilityLimit: z.number().positive().optional(), userLimit: z.number().positive().optional() });
export const itemSchema = z.object({ name: z.string().min(2), sku: z.string().min(2), group: z.string().min(1), category: z.string().min(1), openingQty: z.number().min(0), mrp: z.number().min(0), sellingPrice: z.number().min(0), lowStock: z.number().min(0) });
export const stockMovementSchema = z.object({ itemId: z.string().min(1), godownId: z.string().min(1), quantity: z.number().positive(), remark: z.string().optional() });
export const manualAdjustmentSchema = stockMovementSchema.extend({ physicalQuantity: z.number().min(0), remark: z.string().min(3) });
