import { Router } from "express";
import { Schema, model, Types } from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";

const notificationSchema = new Schema({
  organizationId: { type: Types.ObjectId, ref: "Organization", index: true },
  userId: { type: Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: "info" },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = model("Notification", notificationSchema);
const router = Router();

router.get("/notifications", asyncHandler(async (req, res) => sendList(res, "Notifications fetched", await Notification.find(req.query).sort({ createdAt: -1 }))));
router.post("/notifications", asyncHandler(async (req, res) => sendSuccess(res, "Notification created", await Notification.create(req.body), 201)));
router.patch("/notifications/:id/read", asyncHandler(async (req, res) => sendSuccess(res, "Notification marked as read", await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true }))));

export default router;
