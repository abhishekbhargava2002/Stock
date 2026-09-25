import { Schema, model, Types } from "mongoose";
import Counter from "../../../models/counter/counter.Model";

const stockOutItemSchema = new Schema(
  {
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

    unitId: {
      type: Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },

    remark: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);


const stockOutSchema = new Schema(
  {
    stockOutNumber: {
      type: String,
      unique: true,
      index: true,
    },

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

    vendorId: {
      type: Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    godownId: {
      type: Types.ObjectId,
      ref: "Godown",
      required: true,
    },

    vehicleNumber: String,
    driverName: String,
    driverPhone: String,

    invoiceFile: {
      type: String,
      trim: true,
      default: "",
    },

    items: {
      type: [stockOutItemSchema],
      required: true,
    },

    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);


stockOutSchema.pre("save", async function (next) {
  try {
    if (!this.stockOutNumber) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "stockOutNumber" },
        { $inc: { sequenceValue: 1 } },
        { new: true, upsert: true }
      );

      this.stockOutNumber = `SO-${String(
        counter.sequenceValue
      ).padStart(5, "0")}`;
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export const StockOut = model("StockOut", stockOutSchema);