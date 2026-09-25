import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../../middleware/auth.middleware";
import {
    create,
    getAll,
    getById,
    cancel,
    dropDownGodown,
    dropDownItem,
    dropDownUnit,
    lastLedger,
    stockOutLastLedger,
    getStatusList
} from "../../../controllers/stock/stockTransfer/stockTransfer.Controller";

router.use(authenticate, authorize("super_admin"));

router.get("/godown", dropDownGodown);
router.get("/item", dropDownItem);
router.get("/unit", dropDownUnit);
router.get("/ledgers", lastLedger);
router.get("/status", getStatusList)

router.post("/", create);
router.get("/", getAll);

router.post("/:id/cancel", cancel);
router.get("/:id/ledgers", stockOutLastLedger);

router.get("/:id", getById);

export default router;