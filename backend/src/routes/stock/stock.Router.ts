import express from "express";
const router = express.Router();
import { authenticate, authorize } from "../../middleware/auth.middleware";

import { getAllStockLedgers, getStockLedgerById } from '../../controllers/stock/stock.Controller';

router.use(authenticate, authorize("super_admin"));

router.get("/", getAllStockLedgers);
router.get("/:id", getStockLedgerById);

export default router;