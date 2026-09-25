import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Organization } from "./organization.model";
import { Facility } from "../facilities/facility.model";
import { User } from "../users/user.model";
import { Role } from "../roles/role.model";
import { validateBody } from "../../middleware/validate.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendList } from "../../utils/apiResponse";

const router = Router();

const createOrganizationSchema = z.object({
  organization: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    gstNumber: z.string().optional(),
    enforceFacilityLimit: z.boolean().default(false),
    facilityLimit: z.number().min(0).default(0),
    enforceUserLimit: z.boolean().default(false),
    userLimit: z.number().min(0).default(0),
  }),
  facilities: z.array(z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pinCode: z.string().min(6),
    isPrimary: z.boolean().default(false),
  })).min(1),
  superAdmin: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    password: z.string().min(8),
  }),
});

router.post(
  "/",
  validateBody(createOrganizationSchema),
  asyncHandler(async (req, res) => {
    const { organization, facilities, superAdmin } = req.body;

    const org = await Organization.create(organization);
    const createdFacilities = await Facility.insertMany(
      facilities.map((facility: any, index: number) => ({
        ...facility,
        organizationId: org._id,
        isPrimary: index === 0 ? true : facility.isPrimary,
      }))
    );

    const role = await Role.create({
      organizationId: org._id,
      name: "Super Admin",
      description: "Full organization access",
      permissions: {
        masters: { view: true, add: true, edit: true, delete: true, export: true, approve: true },
        stockIn: { view: true, add: true, edit: true, delete: false, export: true, approve: true },
        stockTransfer: { view: true, add: true, edit: true, delete: false, export: true, approve: true },
        stockOut: { view: true, add: true, edit: true, delete: false, export: true, approve: true },
        dailySale: { view: true, add: true, edit: true, delete: false, export: true, approve: true },
        reports: { view: true, add: false, edit: false, delete: false, export: true, approve: false },
        incentives: { view: true, add: true, edit: true, delete: true, export: true, approve: true },
        manage: { view: true, add: true, edit: true, delete: true, export: true, approve: true },
      },
    });

    const passwordHash = await bcrypt.hash(superAdmin.password, 10);
    const user = await User.create({
      organizationId: org._id,
      facilityIds: createdFacilities.map((f) => f._id),
      name: superAdmin.name,
      email: superAdmin.email,
      phone: superAdmin.phone,
      passwordHash,
      roleId: role._id,
      userType: "client",
    });

    return sendSuccess(res, "Organization created successfully", { organization: org, facilities: createdFacilities, superAdmin: user }, 201);
  })
);

router.get("/", asyncHandler(async (_req, res) => {
  const data = await Organization.find().sort({ createdAt: -1 });
  return sendList(res, "Organizations fetched successfully", data);
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  const facilities = await Facility.find({ organizationId: req.params.id });
  return sendSuccess(res, "Organization details fetched", { organization, facilities });
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return sendSuccess(res, "Organization updated", organization);
}));

export default router;
