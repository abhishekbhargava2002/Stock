import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { GodownController } from "../../controllers/godown/godown.Controller";

const router = Router();


router.post("/", authenticate, authorize("super_admin"), GodownController.create);
router.get("/", authenticate, authorize("super_admin"), GodownController.getAll);
router.get("/status", GodownController.status);
router.get("/:id", authenticate, authorize("super_admin"), GodownController.getById);
router.put("/:id", authenticate, authorize("super_admin"), GodownController.update);
router.patch("/:id/status", authenticate, authorize("super_admin"), GodownController.updateStatus);

export default router;