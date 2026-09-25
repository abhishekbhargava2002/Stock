import express from "express";
const router = express.Router();

import { upload } from "../../../config/cloudinary";
import {
    create,
    getAll,
    getById,
    getLedger,
    getAllLedger,
    getAllGodown,
    status,
    cancel,
} from "../../../controllers/stock/stockIn/stockIn.Controller";

import { authenticate, authorize } from "../../../middleware/auth.middleware";

router.use(authenticate, authorize("super_admin"));

router.post("/", upload.single("invoiceFile"), create);

router.get("/godown", getAllGodown);
router.get("/status", status);
router.get("/ledger", getAllLedger);

router.get("/", getAll);

router.get("/:id/ledger", getLedger);
router.get("/:id", getById);

router.post("/:id/cancel", cancel);

export default router;