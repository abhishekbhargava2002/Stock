// import { Router } from "express";
// import { Schema, model, Types } from "mongoose";
// import { asyncHandler } from "../../utils/asyncHandler";
// import { sendList, sendSuccess } from "../../utils/apiResponse";

// const incentiveRuleSchema = new Schema({
//   organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
//   name: { type: String, required: true },
//   description: String,
//   applicableOn: { type: String, enum: ["group", "category", "item"], required: true },
//   applicableId: { type: Types.ObjectId, required: true },
//   vendorId: { type: Types.ObjectId, ref: "Vendor" },
//   incentiveType: { type: String, enum: ["amount", "percentage"], required: true },
//   basedOn: { type: String, enum: ["amount", "quantity"], required: true },
//   ruleType: { type: String, enum: ["singular", "slabwise"], required: true },
//   operator: { type: String, enum: ["=", ">", "<", ">=", "<="], default: ">=" },
//   threshold: Number,
//   incentiveValue: Number,
//   slabs: [{ from: Number, to: Number, incentiveType: String, incentiveValue: Number }],
//   effectiveFrom: Date,
//   effectiveTo: Date,
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
// }, { timestamps: true });

// const IncentiveRule = model("IncentiveRule", incentiveRuleSchema);
// const router = Router();

// router.post("/incentive-rules", asyncHandler(async (req, res) => sendSuccess(res, "Incentive rule created", await IncentiveRule.create(req.body), 201)));
// router.get("/incentive-rules", asyncHandler(async (req, res) => sendList(res, "Incentive rules fetched", await IncentiveRule.find(req.query).sort({ createdAt: -1 }))));
// router.get("/incentive-rules/:id", asyncHandler(async (req, res) => sendSuccess(res, "Incentive rule fetched", await IncentiveRule.findById(req.params.id))));
// router.put("/incentive-rules/:id", asyncHandler(async (req, res) => sendSuccess(res, "Incentive rule updated", await IncentiveRule.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
// router.post("/incentives/calculate", asyncHandler(async (_req, res) => sendSuccess(res, "Calculation endpoint ready", { note: "Connect this to sales data and active incentive rules." })));

// export default router;
