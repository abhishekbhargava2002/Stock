import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import { validateBody } from "../../middleware/validate.middleware";
import { User } from "../users/user.model";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/apiResponse";
import { requireAuth } from "../../middleware/auth.middleware";

const router = Router();

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

function signAccessToken(payload: object) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn });
}

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), status: "active" });
    if (!user) return sendError(res, "Invalid email or password", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return sendError(res, "Invalid email or password", 401);

    const token = signAccessToken({ userId: user._id, organizationId: user.organizationId, role: user.userType });
    return sendSuccess(res, "Login successful", { token, user });
  })
);

router.post(
  "/trivoxa-login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase(), userType: "trivoxa", status: "active" });
    if (!user) return sendError(res, "Invalid Trivoxa access credentials", 401);

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return sendError(res, "Invalid Trivoxa access credentials", 401);

    const token = signAccessToken({ userId: user._id, role: "trivoxa" });
    return sendSuccess(res, "Trivoxa access login successful", { token, user });
  })
);

router.get("/me", requireAuth, asyncHandler(async (req, res) => sendSuccess(res, "Current user fetched", req.user)));
router.post("/logout", asyncHandler(async (_req, res) => sendSuccess(res, "Logged out")));

export default router;
