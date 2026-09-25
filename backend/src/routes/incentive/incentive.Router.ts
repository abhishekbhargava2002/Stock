import express from "express";
const router = express.Router();

import { authenticate, authorize, } from "../../middleware/auth.middleware";
import { create, getAll, getById, update, status, groupDropdown, categoryDropdown, itemDropdown, vendorDropdown } from "../../controllers/incentive/incentive.Controller";

router.use(authenticate, authorize("super_admin"));

router.post("/", create);
router.get("/", getAll);
router.get("/dropdown/groups", groupDropdown);
router.get("/dropdown/categories", categoryDropdown);
router.get("/dropdown/items", itemDropdown);
router.get("/dropdown/vendors", vendorDropdown);
router.get("/:id", getById);
router.put("/:id", update);
router.patch("/:id/status", status);

export default router;