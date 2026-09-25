import { z } from "zod";

export enum RoleType {
    CLIENT_SUPER_ADMIN = "Client Super Admin",
    ADMIN = "Admin",
    FACILITY_ADMIN = "Facility Admin",
    STOCK_MANAGER = "Stock Manager",
    SALES_OPERATOR = "Sales Operator",
    REPORT_VIEWER = "Report Viewer",
}

export enum EmployeeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export enum GenderType {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other",
}


// CREATE EMPLOYEE VALIDATION
export const createEmployeeSchema = z.object({

    fullName: z
        .string({
            required_error: "Full name is required",
            invalid_type_error:
                "Full name must be a string",
        })
        .trim()
        .min(3,
            "Full name must be at least 3 characters"
        )
        .max(100,
            "Full name cannot exceed 100 characters"
        ),

    email: z
        .string({
            required_error: "Email is required",
            invalid_type_error:
                "Email must be a string",
        })
        .trim()
        .email("Invalid email address")
        .toLowerCase(),

    phoneNumber: z
        .string({
            required_error:
                "Phone number is required",
            invalid_type_error:
                "Phone number must be a string",
        })
        .trim()
        .regex(
            /^[0-9]+$/,
            "Phone number must contain only digits"
        )
        .min(10,
            "Phone number must be at least 10 digits"
        )
        .max(15,
            "Phone number cannot exceed 15 digits"
        ),

    gender: z
        .nativeEnum(GenderType, {
            invalid_type_error:
                "Invalid gender type",
        })
        .optional(),

    role: z.nativeEnum(RoleType, {
        required_error: "Role is required",
        invalid_type_error:
            "Invalid role type",
    }),

    facilityId: z
        .string({
            invalid_type_error:
                "Facility id must be a string",
        })
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid facility id"
        )
        .optional(),

    status: z
        .nativeEnum(EmployeeStatus, {
            invalid_type_error:
                "Invalid status type",
        })
        .optional(),
});


// UPDATE EMPLOYEE VALIDATION
export const updateEmployeeSchema = z.object({

    fullName: z
        .string({
            invalid_type_error:
                "Full name must be a string",
        })
        .trim()
        .min(3,
            "Full name must be at least 3 characters"
        )
        .max(100,
            "Full name cannot exceed 100 characters"
        )
        .optional(),

    email: z
        .string({
            invalid_type_error:
                "Email must be a string",
        })
        .trim()
        .email("Invalid email address")
        .toLowerCase()
        .optional(),

    phoneNumber: z
        .string({
            invalid_type_error:
                "Phone number must be a string",
        })
        .trim()
        .regex(
            /^[0-9]+$/,
            "Phone number must contain only digits"
        )
        .min(10,
            "Phone number must be at least 10 digits"
        )
        .max(15,
            "Phone number cannot exceed 15 digits"
        )
        .optional(),

    gender: z
        .nativeEnum(GenderType, {
            invalid_type_error:
                "Invalid gender type",
        })
        .optional(),

    role: z
        .nativeEnum(RoleType, {
            invalid_type_error:
                "Invalid role type",
        })
        .optional(),

    facilityId: z
        .string({
            invalid_type_error:
                "Facility id must be a string",
        })
        .regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid facility id"
        )
        .optional(),
});


export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;