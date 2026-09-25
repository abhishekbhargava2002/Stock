import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../../middleware/auth.middleware";

import {
    create,
    getAll,
    getById,
    cancel,
    vendorDropDown,
    godownDropDown,
    lastLedger,
    stockOutLastLedger,
    status,
} from "../../../controllers/stock/stockOut/stockOut.Controller";

router.use(authenticate, authorize("super_admin"));

router.post("/", create);
router.get("/", getAll);

// ✅ Static routes first
router.get("/vendors", vendorDropDown);
router.get("/godowns", godownDropDown);
router.get("/ledgers", lastLedger)
router.get("/status", status);

// ✅ Dynamic routes after
router.get("/:id", getById);
router.post("/:id/cancel", cancel);
router.get("/:id/ledgers", stockOutLastLedger);

export default router;