import express from "express";
const router = express.Router();

import { authenticate, authorize, } from "../../middleware/auth.middleware";
import { create, getAll, getById, update, ruleDropDown } from "../../controllers/scheme/scheme.Controller";

router.use(authenticate, authorize("super_admin"));

router.post("/", create);
router.get("/", getAll);
router.get("/rule-dropdown", ruleDropDown);
router.get("/:id", getById);
router.put("/:id", update);

export default router;