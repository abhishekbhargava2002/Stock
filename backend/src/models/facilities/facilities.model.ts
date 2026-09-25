import { Schema, model, Types } from "mongoose";

const facilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    address: {
      type: String,
    },

    organization: {
      type: Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  { timestamps: true }
);

facilitySchema.index({ organization: 1, code: 1 }, { unique: true });

export const Facility = model("Facility", facilitySchema);