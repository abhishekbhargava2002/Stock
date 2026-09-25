import express from "express";
import {
    createUnit,
    updateUnit,
    getAllUnits,
    status,
} from "../../controllers/unit/unit.Controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
const router = express.Router();

router.post("/", authenticate, authorize("super_admin"), createUnit);
router.get("/", authenticate, authorize("super_admin"), getAllUnits);
router.put("/:id", authenticate, authorize("super_admin"), updateUnit);
router.get("/status", authenticate, authorize("super_admin"), status);

export default router;