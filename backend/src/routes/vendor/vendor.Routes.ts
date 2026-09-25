import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { VendorController } from "../../controllers/vendor/vendor.Controller";
const router = Router();


router.post("/", authenticate, authorize("super_admin"), VendorController.create);
router.get("/", authenticate, authorize("super_admin"), VendorController.getAll);
router.get("/status", VendorController.status);
router.get("/:id", authenticate, authorize("super_admin"), VendorController.getById);
router.put("/:id", authenticate, authorize("super_admin"), VendorController.update);
router.patch("/:id/status", authenticate, authorize("super_admin"), VendorController.updateStatus);

export default router;