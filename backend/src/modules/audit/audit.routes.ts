import { Router } from "express";
import { Schema, model, Types } from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";

const auditLogSchema = new Schema({
  organizationId: { type: Types.ObjectId, ref: "Organization", index: true },
  userId: { type: Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: Types.ObjectId },
  oldValue: Schema.Types.Mixed,
  newValue: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
}, { timestamps: true });

const AuditLog = model("AuditLog", auditLogSchema);
const router = Router();

router.get("/audit-logs", asyncHandler(async (req, res) => sendList(res, "Audit logs fetched", await AuditLog.find(req.query).sort({ createdAt: -1 }))));
router.get("/audit-logs/:id", asyncHandler(async (req, res) => sendSuccess(res, "Audit log fetched", await AuditLog.findById(req.params.id))));
router.post("/audit-logs", asyncHandler(async (req, res) => sendSuccess(res, "Audit log created", await AuditLog.create(req.body), 201)));

export default router;
