import { z } from "zod";

export const createVendorValidation = z.object({
    vendorName: z
        .string({
            required_error: "VendorName is required",
            invalid_type_error: "VendorName must be string",
        })
        .trim()
        .min(2, "Vendor name must be at least 2 characters")
        .max(100, "Vendor name cannot exceed 100 characters"),

    phoneNumber: z
        .string({
            required_error: "PhoneNumber is required",
            invalid_type_error: "PhoneNumber must be string",
        })
        .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),

    gstNumber: z
        .string()
        .trim()
        .toUpperCase()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
            "Invalid GST number"
        )
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),

    status: z.enum(["active", "inactive"], {
        errorMap: () => ({
            message: "Status must be active or inactive",
        }),
    }),

    address: z
        .string({
            required_error: "Address is required",
            invalid_type_error: "Address must be string",
        })
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address cannot exceed 500 characters"),
});


export const updateVendorValidation = z.object({
    vendorName: z
        .string({
            invalid_type_error: "VendorName must be string",
        })
        .trim()
        .min(2, "Vendor name must be at least 2 characters")
        .max(100, "Vendor name cannot exceed 100 characters")
        .optional(),

    phoneNumber: z
        .string({
            invalid_type_error: "PhoneNumber must be string",
        })
        .regex(/^[6-9]\d{9}$/, "Invalid phone number")
        .optional(),

    email: z
        .string()
        .trim()
        .email("Invalid email address")
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),

    gstNumber: z
        .string()
        .trim()
        .toUpperCase()
        .regex(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/,
            "Invalid GST number"
        )
        .optional()
        .or(z.literal(""))
        .transform((val) => (val === "" ? undefined : val)),

    address: z
        .string({
            invalid_type_error: "Address must be string",
        })
        .trim()
        .min(5, "Address must be at least 5 characters")
        .max(500, "Address cannot exceed 500 characters")
        .optional(),
});