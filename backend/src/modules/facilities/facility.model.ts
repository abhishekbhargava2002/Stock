// import { Schema, model, Types } from "mongoose";

// const facilitySchema = new Schema(
//   {
//     organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//     name: { type: String, required: true, trim: true },
//     code: { type: String, required: true, trim: true },
//     phone: { type: String, required: true, trim: true },
//     address: { type: String, required: true, trim: true },
//     city: { type: String, required: true, trim: true },
//     state: { type: String, required: true, trim: true },
//     pinCode: { type: String, required: true, trim: true },
//     isPrimary: { type: Boolean, default: false },
//     status: { type: String, enum: ["active", "inactive"], default: "active" },
//   },
//   { timestamps: true }
// );

// facilitySchema.index({ organizationId: 1, code: 1 }, { unique: true });

// export const Facility = model("Facility", facilitySchema);
