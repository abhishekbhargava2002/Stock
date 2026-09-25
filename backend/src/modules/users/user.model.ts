// import { Schema, model, Types } from "mongoose";

// const userSchema = new Schema(
//   {
//     organizationId: { type: Types.ObjectId, ref: "Organization", index: true },
//     facilityIds: [{ type: Types.ObjectId, ref: "Facility" }],
//     name: { type: String, required: true, trim: true },
//     email: { type: String, required: true, lowercase: true, trim: true },
//     phone: { type: String, required: true, trim: true },
//     passwordHash: { type: String, required: true },
//     roleId: { type: Types.ObjectId, ref: "Role" },
//     userType: { type: String, enum: ["trivoxa", "client"], default: "client" },
//     status: { type: String, enum: ["active", "inactive"], default: "active" },
//     lastLoginAt: { type: Date },
//   },
//   { timestamps: true }
// );

// userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ organizationId: 1, phone: 1 });

// export const User = model("User", userSchema);
