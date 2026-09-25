import express from "express";
const router = express.Router();

import { authenticate, authorize, } from "../../middleware/auth.middleware";
import { create, getAll, getById, upstatus, vendorDropdown, employeeDropdown, ruleDropdown, schemeDropdown } from "../../controllers/incentiveReport/incentiveReport.Controller";

router.use(authenticate, authorize("super_admin"));

router.post("/", create);
router.get("/", getAll);

router.get("/vendor-dropdown", vendorDropdown);
router.get("/employee-dropdown", employeeDropdown);
router.get("/rule-dropdown", ruleDropdown);
router.get("/scheme-dropdown/:ruleId", schemeDropdown);
router.get("/:id", getById);
router.patch("/:id/status", upstatus);

export default router;