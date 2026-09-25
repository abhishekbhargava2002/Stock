import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "./user.model";
import { validateBody } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";

const router = Router();
const schema = z.object({ organizationId: z.string().optional(), facilityIds: z.array(z.string()).optional(), name: z.string().min(2), email: z.string().email(), phone: z.string().min(10), password: z.string().min(8), roleId: z.string().optional(), userType: z.enum(["trivoxa","client"]).optional(), status: z.enum(["active","inactive"]).optional() });
router.post("/", validateBody(schema), asyncHandler(async (req,res)=> { const { password, ...rest } = req.body; const passwordHash = await bcrypt.hash(password,10); return sendSuccess(res,"User created", await User.create({ ...rest, passwordHash }),201); }));
router.get("/", asyncHandler(async (req,res)=> sendList(res,"Users fetched", await User.find(req.query).select("-passwordHash").sort({createdAt:-1}))));
router.get("/:id", asyncHandler(async (req,res)=> sendSuccess(res,"User fetched", await User.findById(req.params.id).select("-passwordHash"))));
router.put("/:id", asyncHandler(async (req,res)=> sendSuccess(res,"User updated", await User.findByIdAndUpdate(req.params.id, req.body,{new:true}).select("-passwordHash"))));
export default router;
