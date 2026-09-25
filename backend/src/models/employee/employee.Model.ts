import { Schema, model, Types } from "mongoose";

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

const EmployeeSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: Object.values(GenderType),
        },

        role: {
            type: String,
            enum: Object.values(RoleType),
            required: true,
        },

        facilityId: {
            type: Types.ObjectId,
            ref: "Facility",
            default: null,
        },

        status: {
            type: String,
            enum: Object.values(EmployeeStatus),
            default: EmployeeStatus.ACTIVE,
        },

        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Optional compound index
EmployeeSchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

export const Employee = model("Employee", EmployeeSchema);