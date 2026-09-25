import mongoose, { Schema, model, Types } from "mongoose";
import Counter from "../../../models/counter/counter.Model";


const stockTransferItemSchema = new Schema(
    {
        itemId: {
            type: Types.ObjectId,
            ref: "Item",
            required: true,
        },

        sku: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        unit: {
            type: Types.ObjectId,
            ref: "Unit",
            required: true,
        },

        availableQty: {
            type: Number,
            required: true,
            min: [0, "Available quantity cannot be negative"],
        },

        transferQty: {
            type: Number,
            required: true,
            min: [0.01, "Transfer quantity must be greater than 0"],
        },

        balancePreview: {
            type: Number,
            required: true,
            min: [0, "Balance preview cannot be negative"],
        },

        remark: {
            type: String,
            trim: true,
            maxlength: 300,
        },
    },
    {
        _id: false,
    }
);

const stockTransferSchema = new Schema(
    {
        stockTransferNumber: {
            type: String,
            unique: true,
            index: true,
        },
        organizationId: {
            type: Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true,
        },

        facilityId: {
            type: Types.ObjectId,
            ref: "Facility",
            required: true,
            index: true,
        },

        // ==============================
        // Godown Details
        // ==============================

        sourceGodownId: {
            type: Types.ObjectId,
            ref: "Godown",
            required: true,
        },

        destinationGodownId: {
            type: Types.ObjectId,
            ref: "Godown",
            required: true,
        },

        // ==============================
        // Vehicle / Driver Details
        // ==============================

        vehicleNumber: {
            type: String,
            trim: true,
            uppercase: true,
            maxlength: 20,
        },

        driverName: {
            type: String,
            trim: true,
        },

        driverPhone: {
            type: String,
            trim: true,
            match: [/^[0-9]{10}$/, "Invalid driver phone number"],
        },

        // ==============================
        // Transfer Items
        // ==============================

        items: {
            type: [stockTransferItemSchema],

            validate: {
                validator: function (value: any[]) {
                    return (
                        Array.isArray(value) &&
                        value.length > 0
                    );
                },

                message: "At least one item is required",
            },
        },

        // ==============================
        // Transfer Status
        // ==============================

        status: {
            type: String,
            enum: [
                "draft",
                "in_transit",
                "completed",
                "cancelled",
            ],
            default: "completed",
        },

        // ==============================
        // Cancellation Details
        // ==============================

        cancellationReason: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        createdBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

    },
    {
        timestamps: true,
        versionKey: false,
    }
);


stockTransferSchema.index({
    transferNumber: 1,
});

stockTransferSchema.index({
    organizationId: 1,
    facilityId: 1,
});

stockTransferSchema.index({
    sourceGodownId: 1,
});

stockTransferSchema.index({
    destinationGodownId: 1,
});

stockTransferSchema.index({
    status: 1,
});

stockTransferSchema.index({
    createdAt: -1,
});

// ======================================
// Pre Validation
// ======================================

stockTransferSchema.pre("validate", function (next) {
    // Source and destination cannot be same

    if (
        this.sourceGodownId &&
        this.destinationGodownId &&
        this.sourceGodownId.toString() ===
        this.destinationGodownId.toString()
    ) {
        return next(
            new Error(
                "Source godown and destination godown cannot be same"
            )
        );
    }

    // Validate item quantities

    for (const item of this.items) {
        if (item.transferQty > item.availableQty) {
            return next(new Error(`${item.sku} transfer quantity exceeds available quantity`));
        }
        item.balancePreview = item.availableQty - item.transferQty;
    }
    next();
});


stockTransferSchema.pre("save", async function (next) {
    try {
        if (!this.stockTransferNumber) {
            const counter = await Counter.findOneAndUpdate(
                { _id: "stockTransferNumber" },
                { $inc: { sequenceValue: 1 } },
                { new: true, upsert: true }
            );

            this.stockTransferNumber = `ST-${String(
                counter.sequenceValue
            ).padStart(5, "0")}`;
        }

        next();
    } catch (error) {
        next(error as Error);
    }
});


const StockTransfer = model("StockTransfer", stockTransferSchema);

export default StockTransfer;