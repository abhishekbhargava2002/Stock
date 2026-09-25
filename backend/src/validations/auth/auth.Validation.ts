import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string({ required_error: "username is required" })
        .trim()
        .min(2, "username must be at least 2 characters"),

    email: z
        .string({ required_error: "email is required" })
        .trim()
        .toLowerCase()
        .email("invalid email format"),

    phone: z
        .string({ required_error: "phone is required" })
        .trim()
        .regex(/^[0-9]+$/, "phone must contain only digits")
        .min(10, "phone must be at least 10 digits")
        .max(15, "phone must not exceed 15 digits"),

    password: z
        .string({ required_error: "password is required" })
        .min(6, "password must be at least 6 characters"),

    role: z.enum(["trivoxa"]).default("trivoxa"),
    status: z.enum(["active", "inactive"]).default("active"),
});

export const loginSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
});



export const userLoginSchema = z.object({
    identifier: z
        .string({
            required_error: "Email or username is required",
        })
        .trim(),

    password: z
        .string({
            required_error: "Password is required",
        })
        .min(6, "Password must be at least 6 characters"),
});