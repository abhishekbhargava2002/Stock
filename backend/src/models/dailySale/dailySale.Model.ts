import { Schema, model, Types } from "mongoose";

const dailySaleItemSchema = new Schema(
    {
        itemId: {
            type: Types.ObjectId,
            ref: "Item",
            required: true,
        },

        SkuCode: {
            type: String,
            // required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const dailySaleSchema = new Schema(
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

        godownId: {
            type: Types.ObjectId,
            ref: "Godown",
            required: true,
        },

        saleDate: {
            type: Date,
            required: true,
        },

        items: {
            type: [dailySaleItemSchema],
            required: true,
            validate: {
                validator: (items: any[]) => items.length > 0,
                message: "At least one item is required",
            },
        },

        totalAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        attachment: {
            type: String,
            default: "",
            trim: true,
        },

        remark: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
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
        
        cancelledAt: {
            type: Date,
        },

        cancelledBy: {
            type: Types.ObjectId,
            ref: "User",
        },

        cancellationReason: {
            type: String,
            default: "",
            trim: true,
        },

    },
    {
        timestamps: true,
    }
);

export const DailySale = model("DailySale", dailySaleSchema);