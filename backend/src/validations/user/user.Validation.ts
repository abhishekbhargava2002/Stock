import { z } from "zod";

export const updateUserSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .optional(),

    email: z
        .string()
        .email("Invalid email format")
        .optional(),

    phone: z
        .string()
        .min(10, "Phone number must be 10 digits")
        .max(15, "Phone number is too long")
        .optional(),

    role: z
        .enum(["super_admin", "admin", "user"])
        .optional(),

});