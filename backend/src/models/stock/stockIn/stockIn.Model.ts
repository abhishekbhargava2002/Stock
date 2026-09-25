import { Schema, model, Types } from "mongoose";
import Counter from "../../../models/counter/counter.Model";

const lineItemSchema = new Schema(
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

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitId: {
      type: Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    batchNo: {
      type: String,
      trim: true,
      default: "",
    },

    remark: {
      type: String,
      trim: true,
      default: "",
    },

    // ✅ Auto Amount
    amount: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

// ======================================================
// 🔹 AUTO CALCULATE ITEM AMOUNT
// ======================================================

lineItemSchema.pre("validate", function (next) {
  this.amount =
    Number(this.quantity) *
    Number(this.purchasePrice);

  next();
});

const stockInSchema = new Schema(
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

    // ==================================================
    // 🔹 VENDOR & INVOICE
    // ==================================================

    vendorId: {
      type: Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    invoiceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceFile: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // 🔹 GODOWN & VEHICLE
    // ==================================================

    destinationGodownId: {
      type: Types.ObjectId,
      ref: "Godown",
      required: true,
    },

    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    driverName: {
      type: String,
      trim: true,
      default: "",
    },

    driverPhone: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // 🔹 STOCK IN NUMBER
    // ==================================================

    stockInNumber: {
      type: String,
      unique: true,
    },

    // ==================================================
    // 🔹 ITEMS
    // ==================================================

    items: {
      type: [lineItemSchema],

      validate: {
        validator: function (value: any[]) {
          return (
            Array.isArray(value) &&
            value.length > 0
          );
        },

        message:
          "At least one item is required",
      },
    },

    // ==================================================
    // 🔹 TOTALS
    // ==================================================

    totalQuantity: {
      type: Number,
      default: 0,
    },

    totalValue: {
      type: Number,
      default: 0,
    },

    // ==================================================
    // 🔹 STATUS
    // ==================================================

    status: {
      type: String,

      enum: [
        "draft",
        "completed",
        "cancelled",
      ],

      default: "completed",
    },

    // ==================================================
    // 🔹 NOTES
    // ==================================================

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // 🔹 CREATED BY
    // ==================================================

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

// ======================================================
// 🔹 PRE SAVE
// ======================================================

stockInSchema.pre("save", async function (next) {
  try {
    // ✅ Generate Stock In Number
    if (!this.stockInNumber) {
      const counter =
        await Counter.findOneAndUpdate(
          {
            _id: "stockInNumber",
          },

          {
            $inc: {
              sequenceValue: 1,
            },
          },

          {
            new: true,
            upsert: true,
          }
        );

      this.stockInNumber = `SI-${String(
        counter.sequenceValue
      ).padStart(5, "0")}`;
    }

    // ✅ Calculate Total Quantity
    this.totalQuantity =
      this.items.reduce(
        (sum, item) =>
          sum + Number(item.quantity),
        0
      );

    // ✅ Calculate Total Value
    this.totalValue =
      this.items.reduce(
        (sum, item) =>
          sum + Number(item.amount),
        0
      );

    next();
  } catch (error) {
    next(error as Error);
  }
});

// ======================================================
// 🔹 EXPORT MODEL
// ======================================================

export const StockIn = model(
  "StockIn",
  stockInSchema
);