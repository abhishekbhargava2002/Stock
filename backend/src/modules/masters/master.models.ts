// import { Schema, model, Types } from "mongoose";

// const baseOptions = { timestamps: true } as const;

// export const Group = model(
//   "Group",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       name: { type: String, required: true, trim: true },
//       description: { type: String, trim: true },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, name: 1 }, { unique: true })
// );

// export const Category = model(
//   "Category",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       groupId: { type: Types.ObjectId, ref: "Group", required: true },
//       parentCategoryId: { type: Types.ObjectId, ref: "Category" },
//       name: { type: String, required: true, trim: true },
//       description: { type: String, trim: true },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, groupId: 1, parentCategoryId: 1, name: 1 }, { unique: true })
// );

// export const Unit = model(
//   "Unit",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       name: { type: String, required: true, trim: true },
//       shortCode: { type: String, required: true, trim: true, uppercase: true },
//       description: { type: String, trim: true },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, shortCode: 1 }, { unique: true })
// );

// export const Item = model(
//   "Item",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       name: { type: String, required: true, trim: true },
//       description: { type: String, trim: true },
//       skuCode: { type: String, required: true, trim: true, uppercase: true },
//       imageUrl: { type: String },
//       groupId: { type: Types.ObjectId, ref: "Group", required: true },
//       categoryId: { type: Types.ObjectId, ref: "Category", required: true },
//       partNumber: String,
//       batchNumber: String,
//       manufacturingDate: Date,
//       expiryDate: Date,
//       mrp: { type: Number, default: 0 },
//       standardSellingPrice: { type: Number, default: 0 },
//       primaryUnitId: { type: Types.ObjectId, ref: "Unit", required: true },
//       secondaryUnitId: { type: Types.ObjectId, ref: "Unit" },
//       conversionRate: { type: Number, default: 1 },
//       lowStockQuantity: { type: Number, default: 0 },
//       lowStockNotificationEnabled: { type: Boolean, default: false },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, skuCode: 1 }, { unique: true })
// );

// export const Godown = model(
//   "Godown",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       facilityId: { type: Types.ObjectId, ref: "Facility", required: true, index: true },
//       name: { type: String, required: true, trim: true },
//       description: String,
//       address: String,
//       isDefault: { type: Boolean, default: false },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, facilityId: 1, name: 1 }, { unique: true })
// );

// export const Vendor = model(
//   "Vendor",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       name: { type: String, required: true, trim: true },
//       address: { type: String, required: true },
//       phone: { type: String, required: true },
//       email: { type: String, lowercase: true, trim: true },
//       gstNumber: { type: String, trim: true, uppercase: true },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, phone: 1 })
// );

// export const Employee = model(
//   "Employee",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       facilityId: { type: Types.ObjectId, ref: "Facility" },
//       name: { type: String, required: true },
//       email: { type: String, required: true, lowercase: true, trim: true },
//       phone: { type: String, required: true },
//       gender: { type: String, enum: ["male", "female", "other", "not_specified"], default: "not_specified" },
//       role: { type: String, required: true },
//       status: { type: String, enum: ["active", "inactive"], default: "active" },
//     },
//     baseOptions
//   ).index({ organizationId: 1, email: 1 }, { unique: true })
// );
