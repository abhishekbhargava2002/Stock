import { Router } from "express";
import { z } from "zod";
import { Facility } from "./facility.model";
import { validateBody } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendList, sendSuccess } from "../../utils/apiResponse";

const router = Router();
const schema = z.object({
  organizationId: z.string(), name: z.string().min(2), code: z.string().min(2), phone: z.string().min(10), address: z.string().min(5), city: z.string(), state: z.string(), pinCode: z.string().min(6), isPrimary: z.boolean().optional(), status: z.enum(["active", "inactive"]).optional()
});
router.post("/", validateBody(schema), asyncHandler(async (req,res)=> sendSuccess(res,"Facility created", await Facility.create(req.body),201)));
router.get("/", asyncHandler(async (req,res)=> sendList(res,"Facilities fetched", await Facility.find(req.query).sort({createdAt:-1}))));
router.get("/:id", asyncHandler(async (req,res)=> sendSuccess(res,"Facility fetched", await Facility.findById(req.params.id))));
router.put("/:id", asyncHandler(async (req,res)=> sendSuccess(res,"Facility updated", await Facility.findByIdAndUpdate(req.params.id, req.body,{new:true}))));
export default router;
