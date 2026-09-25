// import { Schema, model, Types } from "mongoose";

// const organizationSchema = new Schema(
//   {
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, lowercase: true, trim: true },
//     phone: { type: String, required: true, trim: true },
//     address: { type: String, required: true, trim: true },
//     gstNumber: { type: String, trim: true },
//     enforceFacilityLimit: { type: Boolean, default: false },
//     facilityLimit: { type: Number, default: 0 },
//     enforceUserLimit: { type: Boolean, default: false },
//     userLimit: { type: Number, default: 0 },
//     status: { type: String, enum: ["active", "inactive"], default: "active" },
//     createdBy: { type: Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// organizationSchema.index({ email: 1 }, { unique: true });

// export const Organization = model("Organization", organizationSchema);
