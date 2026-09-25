import { Schema, model, Types } from "mongoose";

const incentiveReportSchema = new Schema(
    {
        organizationId: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        /* BENEFICIARY */
        employeeId: {
            type: Types.ObjectId,
            ref: "Employee",
        },

        vendorId: {
            type: Types.ObjectId,
            ref: "Vendor",
        },


        /* RULE & SCHEME */
        schemeId: {
            type: Types.ObjectId,
            ref: "Scheme",
            required: true,
        },

        ruleId: {
            type: Types.ObjectId,
            ref: "IncentiveRule",
            required: true,
        },

        /* SALE SNAPSHOT */
        saleAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        saleQty: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        /* INCENTIVE SNAPSHOT */
        incentiveType: {
            type: String,
            enum: ["amount", "percentage"],
            required: true,
        },

        incentiveValue: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        finalIncentive: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        incentiveDate: {
            type: Date,
            default: Date.now,
        },

        /* AUDIT */
        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["pending", "approved", "paid", "cancelled"],
            default: "pending",
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

incentiveReportSchema.index({ organizationId: 1, incentiveDate: -1, });

export const IncentiveReport = model("IncentiveReport", incentiveReportSchema);