import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { createOrganization, fetchAllOrganization, getOrganizationById, UpdateOrganization } from '../../controllers/organization/organization.Controller'

router.post("/", authenticate, authorize("trivoxa"), createOrganization);
router.get("/", authenticate, authorize("trivoxa"), fetchAllOrganization);
router.get("/:id", authenticate, authorize("trivoxa"), getOrganizationById);
router.put("/:id", authenticate, authorize("trivoxa"), UpdateOrganization);


export default router;