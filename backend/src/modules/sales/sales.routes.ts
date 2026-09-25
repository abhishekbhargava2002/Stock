// import { Router } from "express";
// import { Schema, model, Types } from "mongoose";
// import { asyncHandler } from "../../utils/asyncHandler";
// import { sendList, sendSuccess } from "../../utils/apiResponse";

// const dailySaleSchema = new Schema({
//   organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//   facilityId: { type: Types.ObjectId, ref: "Facility", required: true },
//   godownId: { type: Types.ObjectId, ref: "Godown", required: true },
//   saleDate: { type: Date, required: true },
//   entryMode: { type: String, enum: ["manual", "photo", "upload"], default: "manual" },
//   items: [{ itemId: { type: Types.ObjectId, ref: "Item" }, quantity: Number, sellingPrice: Number, amount: Number, remark: String }],
//   totalQuantity: { type: Number, default: 0 },
//   totalAmount: { type: Number, default: 0 },
//   status: { type: String, enum: ["completed", "cancelled"], default: "completed" },
//   createdBy: { type: Types.ObjectId, ref: "User" },
// }, { timestamps: true });

// const DailySale = model("DailySale", dailySaleSchema);
// const router = Router();

// router.post("/daily-sales", asyncHandler(async (req, res) => {
//   const totalQuantity = req.body.items?.reduce((s: number, i: any) => s + Number(i.quantity || 0), 0) || 0;
//   const totalAmount = req.body.items?.reduce((s: number, i: any) => s + Number(i.quantity || 0) * Number(i.sellingPrice || 0), 0) || 0;
//   return sendSuccess(res, "Daily sale created", await DailySale.create({ ...req.body, totalQuantity, totalAmount }), 201);
// }));
// router.get("/daily-sales", asyncHandler(async (req, res) => sendList(res, "Daily sales fetched", await DailySale.find(req.query).sort({ createdAt: -1 }))));
// router.get("/daily-sales/:id", asyncHandler(async (req, res) => sendSuccess(res, "Daily sale fetched", await DailySale.findById(req.params.id))));
// router.put("/daily-sales/:id", asyncHandler(async (req, res) => sendSuccess(res, "Daily sale updated", await DailySale.findByIdAndUpdate(req.params.id, req.body, { new: true }))));

// export default router;
