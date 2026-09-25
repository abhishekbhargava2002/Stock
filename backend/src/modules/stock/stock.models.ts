// import { Schema, model, Types } from "mongoose";

// export const STOCK_LEDGER_TYPES = [
//   "OPENING_STOCK",
//   "STOCK_IN",
//   "STOCK_TRANSFER_IN",
//   "STOCK_TRANSFER_OUT",
//   "STOCK_OUT",
//   "DAILY_SALE",
//   "MANUAL_ADJUSTMENT_INCREASE",
//   "MANUAL_ADJUSTMENT_DECREASE",
//   "REVERSAL",
// ] as const;

// const stockLedgerSchema = new Schema(
//   {
//     organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//     facilityId: { type: Types.ObjectId, ref: "Facility", required: true, index: true },
//     godownId: { type: Types.ObjectId, ref: "Godown", required: true, index: true },
//     itemId: { type: Types.ObjectId, ref: "Item", required: true, index: true },
//     transactionType: { type: String, enum: STOCK_LEDGER_TYPES, required: true },
//     quantityIn: { type: Number, default: 0 },
//     quantityOut: { type: Number, default: 0 },
//     balanceQuantity: { type: Number, required: true },
//     unitId: { type: Types.ObjectId, ref: "Unit" },
//     rate: { type: Number, default: 0 },
//     amount: { type: Number, default: 0 },
//     referenceType: { type: String, required: true },
//     referenceId: { type: Types.ObjectId, required: true },
//     remarks: String,
//     createdBy: { type: Types.ObjectId, ref: "User" },
//   },
//   { timestamps: true }
// );

// export const StockLedger = model("StockLedger", stockLedgerSchema);

// const stockBalanceSchema = new Schema(
//   {
//     organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//     facilityId: { type: Types.ObjectId, ref: "Facility", required: true, index: true },
//     godownId: { type: Types.ObjectId, ref: "Godown", required: true, index: true },
//     itemId: { type: Types.ObjectId, ref: "Item", required: true, index: true },
//     availableQuantity: { type: Number, default: 0 },
//     averageRate: { type: Number, default: 0 },
//     stockValue: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// stockBalanceSchema.index({ organizationId: 1, facilityId: 1, godownId: 1, itemId: 1 }, { unique: true });

// export const StockBalance = model("StockBalance", stockBalanceSchema);

// const lineItemSchema = new Schema(
//   {
//     itemId: { type: Types.ObjectId, ref: "Item", required: true },
//     skuCode: String,
//     quantity: { type: Number, required: true },
//     unitId: { type: Types.ObjectId, ref: "Unit" },
//     rate: { type: Number, default: 0 },
//     amount: { type: Number, default: 0 },
//     batchNumber: String,
//     manufacturingDate: Date,
//     expiryDate: Date,
//     remark: String,
//   },
//   { _id: false }
// );

// export const StockIn = model(
//   "StockIn",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       facilityId: { type: Types.ObjectId, ref: "Facility", required: true },
//       vendorId: { type: Types.ObjectId, ref: "Vendor", required: true },
//       destinationGodownId: { type: Types.ObjectId, ref: "Godown", required: true },
//       purchaseDate: { type: Date, required: true },
//       invoiceNumber: String,
//       invoiceUrl: String,
//       vehicleNumber: String,
//       driverName: String,
//       driverPhone: String,
//       items: [lineItemSchema],
//       totalQuantity: { type: Number, default: 0 },
//       totalValue: { type: Number, default: 0 },
//       status: { type: String, enum: ["draft", "completed", "cancelled"], default: "completed" },
//       createdBy: { type: Types.ObjectId, ref: "User" },
//     },
//     { timestamps: true }
//   )
// );

// export const StockTransfer = model(
//   "StockTransfer",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       sourceFacilityId: { type: Types.ObjectId, ref: "Facility", required: true },
//       sourceGodownId: { type: Types.ObjectId, ref: "Godown", required: true },
//       destinationFacilityId: { type: Types.ObjectId, ref: "Facility", required: true },
//       destinationGodownId: { type: Types.ObjectId, ref: "Godown", required: true },
//       vehicleNumber: String,
//       driverName: String,
//       driverPhone: String,
//       items: [lineItemSchema],
//       totalQuantity: { type: Number, default: 0 },
//       status: { type: String, enum: ["draft", "in_transit", "completed", "cancelled"], default: "completed" },
//       createdBy: { type: Types.ObjectId, ref: "User" },
//     },
//     { timestamps: true }
//   )
// );

// export const StockOut = model(
//   "StockOut",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       sourceFacilityId: { type: Types.ObjectId, ref: "Facility", required: true },
//       destinationName: { type: String, required: true },
//       vendorId: { type: Types.ObjectId, ref: "Vendor" },
//       godownId: { type: Types.ObjectId, ref: "Godown", required: true },
//       vehicleNumber: String,
//       driverName: String,
//       driverPhone: String,
//       invoiceUrl: String,
//       remarks: String,
//       items: [lineItemSchema],
//       totalQuantity: { type: Number, default: 0 },
//       totalValue: { type: Number, default: 0 },
//       status: { type: String, enum: ["draft", "completed", "cancelled"], default: "completed" },
//       createdBy: { type: Types.ObjectId, ref: "User" },
//     },
//     { timestamps: true }
//   )
// );

// export const ManualAdjustment = model(
//   "ManualAdjustment",
//   new Schema(
//     {
//       organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//       facilityId: { type: Types.ObjectId, ref: "Facility", required: true },
//       godownId: { type: Types.ObjectId, ref: "Godown", required: true },
//       itemId: { type: Types.ObjectId, ref: "Item", required: true },
//       systemQuantity: { type: Number, required: true },
//       physicalQuantity: { type: Number, required: true },
//       difference: { type: Number, required: true },
//       remark: { type: String, required: true },
//       attachmentUrl: String,
//       createdBy: { type: Types.ObjectId, ref: "User" },
//     },
//     { timestamps: true }
//   )
// );
