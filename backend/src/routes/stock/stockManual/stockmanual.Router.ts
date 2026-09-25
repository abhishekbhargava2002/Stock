import express from "express";
const router = express.Router();
import { upload } from "../../../config/cloudinary";
import {
    create,
    getAll,
    getById,
    cancel,
    lastLedger,
    stockOutLastLedger,
    itemDropDown,
    godownDropDown,
    status,
} from "../../../controllers/stock/stockManual/stockmanual.Controller";

import { authenticate, authorize } from "../../../middleware/auth.middleware";
router.use(authenticate, authorize("super_admin"));

router.get("/ledgers", lastLedger);
router.get("/items", itemDropDown);
router.get("/godowns", godownDropDown);
router.get("/status",status);
router.get("/:id/ledgers", stockOutLastLedger);

// ✅ CRUD
router.post("/", upload.single("attachment"), create);
router.get("/", getAll);

// ⚠️ KEEP THESE LAST
router.get("/:id", getById);
router.post("/:id/cancel", cancel);
export default router;
