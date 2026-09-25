// import { Router } from "express";
// import { z } from "zod";
// import { Role } from "./role.model";
// import { validateBody } from "../../middleware/validate.middleware";
// import { asyncHandler } from "../../utils/asyncHandler";
// import { sendList, sendSuccess } from "../../utils/apiResponse";

// const router = Router();
// const schema = z.object({ organizationId: z.string().optional(), name: z.string().min(2), description: z.string().optional(), permissions: z.any().optional(), status: z.enum(["active","inactive"]).optional() });
// router.post("/", validateBody(schema), asyncHandler(async (req,res)=> sendSuccess(res,"Role created", await Role.create(req.body),201)));
// router.get("/", asyncHandler(async (req,res)=> sendList(res,"Roles fetched", await Role.find(req.query).sort({createdAt:-1}))));
// router.get("/:id", asyncHandler(async (req,res)=> sendSuccess(res,"Role fetched", await Role.findById(req.params.id))));
// router.put("/:id", asyncHandler(async (req,res)=> sendSuccess(res,"Role updated", await Role.findByIdAndUpdate(req.params.id, req.body,{new:true}))));
// router.patch("/:id/permissions", asyncHandler(async (req,res)=> sendSuccess(res,"Permissions updated", await Role.findByIdAndUpdate(req.params.id,{ permissions: req.body.permissions },{new:true}))));
// export default router;
