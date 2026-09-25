import { Schema, model, Types } from "mongoose";

export enum RoleType {
    CLIENT_SUPER_ADMIN = "Client Super Admin",
    ADMIN = "Admin",
    FACILITY_ADMIN = "Facility Admin",
    STOCK_MANAGER = "Stock Manager",
    SALES_OPERATOR = "Sales Operator",
    REPORT_VIEWER = "Report Viewer",
}

const SchemeSchema = new Schema(
    {
        organizationId: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        schemeName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        /*
        =====================
        APPLICABILITY
        =====================
        */

        applicableTo: {
            type: String,
            enum: Object.values(RoleType),
            required: true,
        },

        /*
        =====================
        SCHEME PERIOD
        =====================
        */

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        /*
        =====================
        RULES INCLUDED
        =====================
        */

        ruleIds: [
            {
                type: Types.ObjectId,
                ref: "IncentiveRule",
                required: true,
            },
        ],

        /*
        Allow multiple schemes
        */

        allowMultipleSchemes: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        remarks: {
            type: String,
            default: "",
            trim: true,
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

/*
Business Indexes
*/

SchemeSchema.index(
    {
        organizationId: 1,
        schemeName: 1,
    },
    {
        unique: true,
        collation: {
            locale: "en",
            strength: 2,
        },
    }
);


export const Scheme = model("Scheme", SchemeSchema);