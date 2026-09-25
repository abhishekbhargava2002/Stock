import mongoose, { Schema, Document, Model } from "mongoose";

// ================= TYPES ================= 

export interface IItem extends Document {
    itemName: string;
    description?: string;
    skuCode: string;
    itemPhoto?: string;

    openingQuantity: number;

    group: mongoose.Types.ObjectId;
    category: mongoose.Types.ObjectId;
    openingGodown: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;

    partNumber?: string;
    batchNumber?: string;

    manufacturingDate?: Date;
    expiryDate?: Date;

    mrp?: number;
    standardSellingPrice?: number;

    primaryUnit: mongoose.Types.ObjectId;
    secondaryUnit?: mongoose.Types.ObjectId;
    conversionRate?: number;

    lowStockQuantity?: number;
    lowStockNotification: boolean;

    isActive: boolean;
}

// ================= SCHEMA =================

const ItemSchema: Schema<IItem> = new Schema(
    {
        // ================= BASIC DETAILS =================

        itemName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        skuCode: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        itemPhoto: {
            type: String,
        },

        openingQuantity: {
            type: Number,
            default: 0,
            min: [0, "Quantity cannot be negative"],
        },

        // ================= RELATIONS =================

        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        openingGodown: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Godown",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ================= ADDITIONAL DETAILS =================

        partNumber: {
            type: String,
            trim: true,
        },

        batchNumber: {
            type: String,
            trim: true,
        },

        manufacturingDate: {
            type: Date,
        },

        expiryDate: {
            type: Date,
        },

        // ================= PRICING =================

        mrp: {
            type: Number,
            min: 0,
        },

        standardSellingPrice: {
            type: Number,
            min: 0,
        },

        // ================= UNITS =================

        primaryUnit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
            required: true,
        },

        secondaryUnit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Unit",
        },

        conversionRate: {
            type: Number,
            min: 1,
            required: function (this: IItem) {
                return !!this.secondaryUnit;
            },
        },

        // ================= LOW STOCK =================

        lowStockQuantity: {
            type: Number,
            min: 0,
        },

        lowStockNotification: {
            type: Boolean,
            default: true,
        },

        // ================= STATUS =================

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// ================= VALIDATIONS =================

// Expiry date validation
ItemSchema.pre<IItem>("save", function (next) {
    if (this.manufacturingDate && this.expiryDate && this.expiryDate < this.manufacturingDate) {
        return next(
            new Error("Expiry date cannot be before manufacturing date")
        );
    }
    next();
});

// Selling price validation
ItemSchema.pre<IItem>("save", function (next) {
    if (this.mrp && this.standardSellingPrice && this.standardSellingPrice > this.mrp) {
        return next(
            new Error("Selling price should not exceed MRP")
        );
    }

    next();
});

// ================= METHODS =================

// Check low stock
ItemSchema.methods.isLowStock = function (): boolean {
    if (!this.lowStockQuantity) return false;

    return this.openingQuantity <= this.lowStockQuantity;
};

// ================= INDEX ===============
ItemSchema.index({ userId: 1, skuCode: 1, }, { unique: true });


// ================= MODEL =================
const Item: Model<IItem> = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

export default Item;