import { Schema, model, Types } from "mongoose";

const stockLedgerSchema = new Schema(
    {
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

        itemId: {
            type: Types.ObjectId,
            ref: "Item",
            required: true,
            index: true,
        },

        sku: {
            type: String,
            // required: true,
            uppercase: true,
            trim: true,
        },

        unitId: {
            type: Types.ObjectId,
            ref: "Unit",
            // required: true,
        },

        godownId: {
            type: Types.ObjectId,
            ref: "Godown",
            required: true,
            index: true,
        },

        transactionType: {
            type: String,

            enum: [
                "STOCK_IN",
                "STOCK_OUT",
                "TRANSFER_IN",
                "TRANSFER_OUT",
                "ADJUSTMENT",
                "DAILY_SALE",
                "PURCHASE_RETURN",
                "REVERSAL",
                "MANUAL_ADJUSTMENT"
            ],

            required: true,
            index: true,
        },

        referenceId: {
            type: Types.ObjectId,
            required: true,
            index: true,
        },

        referenceModel: {
            type: String,

            required: true,

            enum: [
                "StockIn",
                "StockOut",
                "StockTransfer",
                "ManualAdjustment",
                "DailySale"
            ],
        },

        referenceNumber: {
            type: String,
            trim: true,
            default: "",
        },

        quantityIn: {
            type: Number,
            default: 0,
            min: 0,
        },

        quantityOut: {
            type: Number,
            default: 0,
            min: 0,
        },

        balanceQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },

        rate: {
            type: Number,
            default: 0,
            min: 0,
        },

        amount: {
            type: Number,
            default: 0,
            min: 0,
        },

        batchNo: {
            type: String,
            trim: true,
            default: "",
        },

        remarks: {
            type: String,
            trim: true,
            default: "",
        },

        transactionDate: {
            type: Date,
            required: true,
            index: true,
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

stockLedgerSchema.index({
    itemId: 1,
    godownId: 1,
    transactionDate: -1,
});

stockLedgerSchema.index({
    organizationId: 1,
    facilityId: 1,
});

stockLedgerSchema.index({
    referenceId: 1,
    referenceModel: 1,
});

// stockLedgerSchema.pre(
//     "validate",
//     function (next) {
//         this.amount =
//             Number(this.quantityIn || 0) *
//             Number(this.rate || 0);

//         next();
//     }
// );

stockLedgerSchema.pre("validate", function (next) {
    this.amount =
        Number(
            this.quantityIn || this.quantityOut || 0
        ) * Number(this.rate || 0);

    next();
});

export const StockLedger = model("StockLedger", stockLedgerSchema);