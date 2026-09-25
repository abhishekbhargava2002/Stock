import { Schema, model, Types } from "mongoose";

const manualAdjustmentSchema = new Schema(
    {
        organizationId: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
        },

        facilityId: {
            type: Types.ObjectId,
            ref: "Facility",
            required: true,
        },

        itemId: {
            type: Types.ObjectId,
            ref: "Item",
            required: true,
        },

        sku: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        godownId: {
            type: Types.ObjectId,
            ref: "Godown",
            required: true,
        },

        // ✅ System stock (from ledger)
        systemQuantity: {
            type: Number,
            required: true,
            min: 0,
        },

        // ✅ Physical stock (user input)
        physicalQuantity: {
            type: Number,
            required: true,
            min: 0,
        },

        // ✅ Difference (auto)
        difference: {
            type: Number,
            required: true,
        },

        // ✅ Adjustment Type
        adjustmentType: {
            type: String,
            enum: ["increase", "decrease"],
            required: true,
        },

        // ✅ File upload (optional)
        attachment: {
            type: String,
            default: "",
            trim: true,
        },

        // ❗ Mandatory
        remark: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["active", "cancelled"],
            default: "active",
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const ManualAdjustment = model("ManualAdjustment", manualAdjustmentSchema);